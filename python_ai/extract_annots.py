import PyPDF2

reader = PyPDF2.PdfReader('../SAD_Alerte (1).pdf')
out = []

for i, page in enumerate(reader.pages):
    if page.annotations:
        for a in page.annotations:
            try:
                obj = a.get_object()
                if '/Contents' in obj:
                    out.append(f"Page {i+1}: {obj['/Contents']}")
            except Exception as e:
                pass

with open('pdf_annots.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
