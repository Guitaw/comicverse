
import { jsPDF } from 'jspdf';
import { Universe, Author, CharacterSection, CharacterTrait, Scene, DialogueEntry, CustomField } from '../../types';

export const exportUniverseToPDF = async (universe: Universe, author: Author) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let cursorY = margin;

  const addNewPage = () => {
    doc.addPage();
    cursorY = margin;
  };

  const checkPageOverflow = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - margin) {
      addNewPage();
    }
  };

  const addText = (text: string, fontSize: number = 12, style: 'normal' | 'bold' | 'italic' = 'normal', color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', style);
    doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = doc.splitTextToSize(text, pageWidth - (margin * 2));
    const textHeight = lines.length * (fontSize * 0.5);
    
    checkPageOverflow(textHeight);
    doc.text(lines, margin, cursorY + (fontSize * 0.3));
    cursorY += textHeight + 2;
  };

  const addImage = async (base64: string, maxWidth: number = 100, maxHeight: number = 100) => {
    try {
      if (!base64 || !base64.startsWith('data:image')) return;
      
      // Get image dimensions
      const img = new Image();
      img.src = base64;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      let width = img.width;
      let height = img.height;

      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;

      checkPageOverflow(height + 5);
      doc.addImage(base64, 'PNG', margin, cursorY, width, height);
      cursorY += height + 5;
    } catch (e) {
      console.error('Error adding image to PDF', e);
    }
  };

  // --- Cover Page ---
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  cursorY = 35;
  addText(universe.name.toUpperCase(), 24, 'bold', [255, 255, 255]);
  
  cursorY = 70;
  if (universe.customLogo) {
    await addImage(universe.customLogo, 60, 60);
  }

  cursorY = Math.max(cursorY, 140);
  addText('PROJETO DE UNIVERSO CRIATIVO', 14, 'bold', [100, 116, 139]);
  addText(`Criado por: ${author.name}`, 12, 'normal');
  addText(`Papel: ${author.role}`, 10, 'italic', [100, 116, 139]);
  addText(`Data de Exportação: ${new Date().toLocaleDateString('pt-BR')}`, 10, 'normal');

  // --- Description ---
  addNewPage();
  addText('VISÃO GERAL DO UNIVERSO', 18, 'bold', [30, 41, 59]);
  doc.setDrawColor(30, 41, 59);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 5;
  addText(universe.description, 12);

  // --- Extra Sections ---
  if (universe.extraSections && universe.extraSections.length > 0) {
    universe.extraSections.forEach((section: CharacterSection) => {
      cursorY += 10;
      addText(section.title.toUpperCase(), 14, 'bold', [51, 65, 85]);
      addText(section.content, 11);
    });
  }

  // --- Characters ---
  if (universe.characters.length > 0) {
    addNewPage();
    addText('PERSONAGENS', 18, 'bold', [30, 41, 59]);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 5;

    for (const char of universe.characters) {
      cursorY += 10;
      checkPageOverflow(40);
      addText(char.name, 16, 'bold', [37, 99, 235]); // Blue-600
      addText(char.role, 12, 'italic', [100, 116, 139]);
      
      if (char.image) {
        await addImage(char.image, 50, 50);
      }
      
      addText('História:', 12, 'bold');
      addText(char.backstory || 'Nenhuma história definida.', 11);

      if (char.traits.length > 0) {
        cursorY += 5;
        addText('Traços e Características:', 11, 'bold');
        char.traits.forEach((trait: CharacterTrait) => {
          addText(`• [${trait.category}] ${trait.description}`, 10);
        });
      }

      if (char.customSections && char.customSections.length > 0) {
        char.customSections.forEach((sec: CharacterSection) => {
          cursorY += 5;
          addText(sec.title, 11, 'bold');
          addText(sec.content, 10);
        });
      }
      
      cursorY += 10;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
    }
  }

  // --- Locations ---
  if (universe.locations.length > 0) {
    addNewPage();
    addText('LOCAIS E CENÁRIOS', 18, 'bold', [30, 41, 59]);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 5;

    for (const loc of universe.locations) {
      cursorY += 10;
      addText(loc.name, 14, 'bold', [5, 150, 105]); // Emerald-600
      addText(`Tipo: ${loc.type}`, 11, 'italic');
      addText(loc.description, 11);
      
      if (loc.images && loc.images.length > 0) {
        for (const img of loc.images) {
          await addImage(img.url, 80, 60);
        }
      }
      
      cursorY += 5;
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
    }
  }

  // --- Scripts ---
  if (universe.scripts.length > 0) {
    addNewPage();
    addText('ROTEIROS E HISTÓRIAS', 18, 'bold', [30, 41, 59]);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 5;

    for (const script of universe.scripts) {
      cursorY += 10;
      addText(script.title, 16, 'bold', [147, 51, 234]); // Purple-600
      addText('Resumo:', 12, 'bold');
      addText(script.summary, 11);

      if (script.scenes.length > 0) {
        cursorY += 5;
        addText('Cenas:', 12, 'bold');
        script.scenes.forEach((scene: Scene, idx: number) => {
          cursorY += 3;
          addText(`Cena ${idx + 1}: ${scene.title || 'Sem título'}`, 11, 'bold');
          addText(scene.description, 10);
          
          if (scene.dialogues && scene.dialogues.length > 0) {
            scene.dialogues.forEach((dial: DialogueEntry) => {
              addText(`${dial.speaker.toUpperCase()}: "${dial.text}"`, 10, 'normal', [71, 85, 105]);
            });
          }
        });
      }
      
      cursorY += 10;
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
    }
  }

  // --- Custom Categories ---
  if (universe.customCategories && universe.customCategories.length > 0) {
    for (const cat of universe.customCategories) {
      addNewPage();
      addText(cat.name.toUpperCase(), 18, 'bold', [30, 41, 59]);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 5;

      for (const item of cat.items) {
        cursorY += 10;
        addText(item.name, 14, 'bold');
        addText(item.description, 11);
        
        if (item.fields && item.fields.length > 0) {
          item.fields.forEach((f: CustomField) => {
            addText(`${f.label}: ${f.value}`, 10);
          });
        }
        
        if (item.images && item.images.length > 0) {
          for (const img of item.images) {
            await addImage(img.url, 60, 60);
          }
        }
        cursorY += 5;
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
      }
    }
  }

  // --- World Notes ---
  if (universe.worldNotes.length > 0) {
    addNewPage();
    addText('NOTAS DE MUNDO', 18, 'bold', [30, 41, 59]);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 5;

    for (const note of universe.worldNotes) {
      cursorY += 10;
      addText(note.title, 14, 'bold');
      addText(note.content, 11);
      cursorY += 5;
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
    }
  }

  // Save the PDF
  doc.save(`${universe.name.replace(/\s+/g, '_')}_projeto.pdf`);
};
