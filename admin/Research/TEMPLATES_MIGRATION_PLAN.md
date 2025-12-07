# Templates Migration Plan

**Document Version:** 1.0
**Created:** 2025-11-28
**Author:** Claude (Phase 7 Analysis)
**Source File:** `/admin/templates.html` (12,594 lines)
**Target:** React/Vite/TypeScript/Tailwind Templates.tsx

---

## Executive Summary

The templates.html file is the most complex file in the GLRS admin system, containing a complete document template builder with WYSIWYG editing, drag-and-drop functionality, multi-page pagination, e-signature workflow, and PDF generation. The migration requires careful planning due to its extensive feature set and tight integration with multiple shared libraries.

**Key Complexity Factors:**
- 28+ React components in a single file
- Custom block-based editor system (NOT using a standard library)
- Multi-role e-signature workflow (PIR, Family, GLRS)
- Real-time pagination with WYSIWYG preview
- PDF/DOCX upload and conversion
- Shared code with sign.html (must maintain compatibility)

---

## 1. Current File Analysis

### 1.1 File Structure

```
templates.html (12,594 lines)
├── External Dependencies (lines 1-70)
│   ├── Firebase SDK
│   ├── React 18 + ReactDOM
│   ├── Babel Standalone (runtime JSX)
│   ├── html2canvas (1.4.1)
│   ├── jsPDF (2.5.1)
│   ├── PDF.js (3.11.174)
│   └── mammoth.js (DOCX conversion)
│
├── Shared Document Libraries (lines 71-150)
│   ├── /shared/document-constants.js
│   ├── /shared/block-styles.js
│   ├── /shared/block-renderer.js
│   └── /shared/pagination.js
│
├── Conversion Functions (lines 150-320)
│   ├── convertPdfToImages()
│   ├── convertDocxToImages()
│   └── uploadPageImagesToStorage()
│
├── Modal Components (lines 320-10200)
│   ├── UploadDocumentModal (lines 321-644)
│   ├── DraggableField (lines 649-799)
│   ├── UploadedDocumentEditor (lines 803-1169)
│   ├── IconPicker (lines 1222-1341)
│   ├── SkeletonCard (lines 1345-1398)
│   ├── EmptyState (lines 1402-1489)
│   ├── TemplateCard (lines 1493-1729)
│   ├── DeleteConfirmModal (lines 1733-1892)
│   ├── TemplateCreateModal (lines 1896-2340)
│   ├── TemplateDetailModal (lines 2344-2915)
│   ├── TemplateEditorModal (lines 3497-4512)
│   ├── CoverPageEditorModal (lines 4516-4856)
│   ├── HeaderEditorModal (lines 4860-5085)
│   ├── FooterEditorModal (lines 5089-5314)
│   ├── EndPageEditorModal (lines 5318-5578)
│   ├── PaletteBlock (lines 5582-5644)
│   ├── CanvasBlock (lines 5648-6166)
│   ├── EditorCoverPage (lines 6172-6235)
│   ├── EditorPageHeader (lines 6236-6280)
│   ├── EditorPageFooter (lines 6281-6302)
│   ├── EditorEndPage (lines 6303-6360)
│   ├── EditorContentPage (lines 6361-6403)
│   ├── BlockPropertiesPanel (lines 6407-7632)
│   ├── DocumentPropertiesPanel (lines 7636-7859)
│   ├── SendForSignatureModal (lines 8546-9439)
│   ├── GLRSSigningModal (lines 9443-9993)
│   └── SendSuccessModal (lines 9997-10186)
│
├── Block Definitions (lines 2916-3050)
│   ├── BLOCK_TYPES (14 types)
│   └── SIGNER_ROLES (3 roles)
│
├── View Components (lines 10187-12330)
│   ├── AgreementRow (lines 10203-10673)
│   ├── AgreementsView (lines 11194-11630)
│   └── TemplatesView (lines 11631-12329)
│
└── Main App (lines 12330-12594)
    └── App() - Root component with auth, routing
```

### 1.2 Functionality Inventory

#### Template Management (CRUD)
| Feature | Location | Complexity |
|---------|----------|------------|
| Create template | TemplateCreateModal | Medium |
| Edit template | TemplateEditorModal | **High** |
| Delete template | DeleteConfirmModal | Low |
| Duplicate template | TemplatesView | Low |
| List templates | TemplatesView | Low |
| Filter by category | TemplatesView | Low |
| Search templates | TemplatesView | Low |

#### WYSIWYG Editor System
| Feature | Location | Complexity |
|---------|----------|------------|
| Block palette (drag source) | PaletteBlock | Medium |
| Canvas blocks (drop targets) | CanvasBlock | **High** |
| Block reordering | moveBlock() | Medium |
| Block properties panel | BlockPropertiesPanel | **High** |
| Document properties | DocumentPropertiesPanel | Medium |
| Cover page editor | CoverPageEditorModal | Medium |
| Header editor | HeaderEditorModal | Medium |
| Footer editor | FooterEditorModal | Medium |
| End page editor | EndPageEditorModal | Medium |
| Preview mode toggle | TemplateEditorModal | Medium |
| Auto-save (2s debounce) | TemplateEditorModal | Low |

#### Block Types (14 total)
| Category | Block Type | Description |
|----------|------------|-------------|
| Structure | section | Section header with number badge |
| Structure | heading | H1-H4 headings |
| Structure | pageBreak | Force new page |
| Content | paragraph | Body text |
| Content | bulletList | Unordered list |
| Signature | signatureField | Digital signature capture |
| Signature | initialsField | Initials capture |
| Signature | dateField | Date picker (auto-fill option) |
| Signature | textInputField | Free text input |
| Signature | checkboxField | Boolean checkbox |
| Signature | dropdownField | Select dropdown |
| Legacy | signatureBlock | Combo signature/name/date |
| Legacy | acknowledgment | Checkbox with long text |

#### E-Signature Workflow
| Feature | Location | Complexity |
|---------|----------|------------|
| Send for signature | SendForSignatureModal | **High** |
| Role-based signing order | SIGNER_ROLES | Medium |
| PIR signing | GLRSSigningModal | **High** |
| Family signing | GLRSSigningModal | **High** |
| GLRS signing | GLRSSigningModal | Medium |
| Signature canvas | GLRSSigningModal | **High** |
| Email notifications | Firebase mail collection | Medium |
| Agreement tracking | AgreementsView | Medium |
| Agreement status | AgreementRow | Low |
| Void agreement | AgreementsView | Low |

#### Document Upload & Conversion
| Feature | Location | Complexity |
|---------|----------|------------|
| PDF upload | UploadDocumentModal | Medium |
| DOCX upload | UploadDocumentModal | Medium |
| PDF to images | convertPdfToImages() | **High** |
| DOCX to images | convertDocxToImages() | **High** |
| Overlay field editor | UploadedDocumentEditor | **High** |
| Draggable fields | DraggableField | Medium |

#### Pagination System
| Feature | Location | Complexity |
|---------|----------|------------|
| Block height calculation | GLRS_DOC.getBlockHeight() | Medium |
| Page distribution | GLRS_DOC.paginateBlocks() | **High** |
| Real-time preview | EditorContentPage | **High** |
| Cover page rendering | EditorCoverPage | Medium |
| Header/footer rendering | EditorPageHeader/Footer | Medium |

### 1.3 Dependencies

#### External CDN Libraries
```html
<!-- Firebase -->
<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js">
<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js">
<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js">
<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-storage-compat.js">

<!-- React -->
<script src="https://unpkg.com/react@18/umd/react.development.js">
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js">
<script src="https://unpkg.com/@babel/standalone/babel.min.js">

<!-- PDF/Document -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js">
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js">
<script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js">
```

#### Shared GLRS Libraries
```javascript
// /shared/document-constants.js (201 lines)
window.GLRS_DOC = {
  PAGE_WIDTH: 816,      // US Letter @ 96 DPI
  PAGE_HEIGHT: 1056,
  PAGE_MARGIN: 60,
  HEADER_HEIGHT: 70,
  FOOTER_HEIGHT: 50,
  USABLE_HEIGHT: 734,   // Calculated with safety margin
  BLOCKS: { ... },      // Block height definitions
  paginateBlocks: fn,   // Pagination algorithm
  getBlockHeight: fn,   // Dynamic height calculation
}

// /shared/block-styles.js (545 lines)
window.GLRS_STYLES = {
  COLORS: { ... },
  TYPOGRAPHY: { ... },
  getSectionStyle: fn,
  getHeadingStyle: fn,
  getSignatureBoxStyle: fn,
  getFieldWrapperStyle: fn,
  // ... 30+ style functions
}

// /shared/block-renderer.js (831 lines)
window.GLRS_RENDERER = {
  renderBlock: fn,
  renderSection: fn,
  renderSignatureField: fn,
  // ... render functions for all block types
}

window.GLRS_REACT = {
  createElement: fn,    // Convert definitions to React elements
  renderBlock: fn,      // React-specific rendering
}
```

### 1.4 Firebase Integration

#### Collections Used
| Collection | Operations | Purpose |
|------------|------------|---------|
| `templates` | CRUD | Template storage |
| `agreements` | CRUD | E-signature agreements |
| `mail` | Create | Email notifications |
| `users` | Read | User data for signing |

#### Template Document Structure
```typescript
interface Template {
  id: string;
  name: string;
  description?: string;
  type: 'document' | 'cover' | 'header' | 'footer' | 'endPage' | 'uploaded';
  status: 'draft' | 'active' | 'archived';
  category?: string;
  icon?: string;
  iconColor?: string;
  tenantId: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // For document templates
  content?: {
    blocks: Block[];
  };
  components?: {
    coverPageId?: string;
    headerId?: string;
    footerId?: string;
    endPageId?: string;
  };

  // For uploaded templates
  uploadedFile?: {
    type: 'pdf' | 'docx';
    originalName: string;
    pages: UploadedPage[];
  };
  overlayFields?: OverlayField[];
}

interface Agreement {
  id: string;
  templateId: string;
  templateName: string;
  status: 'pending' | 'sent' | 'partially_signed' | 'completed' | 'voided';
  signers: Signer[];
  fieldValues: Record<string, any>;
  signatures: Record<string, SignatureData>;
  createdBy: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  tenantId: string;
}
```

### 1.5 Complexity Assessment

#### Why is this file 12,594 lines?

1. **Custom Editor System (4,500+ lines)**
   - Built entirely from scratch without using TipTap, Slate, or any editor library
   - Complete drag-and-drop implementation
   - Block reordering logic
   - Properties panels for every block type
   - Preview rendering system

2. **E-Signature Workflow (2,500+ lines)**
   - Multi-role signing (PIR → Family → GLRS)
   - Signature canvas with touch/mouse support
   - Agreement tracking and status management
   - Email notification integration

3. **Document Conversion (500+ lines)**
   - PDF.js integration for PDF conversion
   - Mammoth.js integration for DOCX conversion
   - Image upload to Firebase Storage

4. **Pagination System (800+ lines)**
   - Dynamic block height calculation
   - Real-time page distribution
   - Cover/Header/Footer/EndPage rendering

5. **UI Components (4,000+ lines)**
   - Multiple modal dialogs
   - Form components
   - Card layouts
   - Loading states

#### Hardest Parts to Migrate

| Component | Difficulty | Reason |
|-----------|------------|--------|
| BlockPropertiesPanel | **Very High** | 1,225 lines with block-specific forms for all 14 types |
| TemplateEditorModal | **Very High** | 1,015 lines with drag-drop, preview, auto-save |
| SendForSignatureModal | **High** | 893 lines with form validation, role logic |
| GLRSSigningModal | **High** | 550 lines with signature canvas, field rendering |
| CanvasBlock | **High** | 518 lines with drag handlers, selection, rendering |
| Pagination Logic | **High** | Complex algorithm shared with sign.html |

---

## 2. Industry Standards Research

### 2.1 Similar Products

#### SimplePractice
- Cloud-based EHR for 225,000+ healthcare providers
- HIPAA-compliant, HITRUST certified
- Pre-built templates (SOAP, DAP formats)
- Customizable documentation templates
- **Takeaway:** Template library + customization is key UX pattern

#### Carepatron
- All-in-one practice management platform
- Community-shared template library
- Free tier available ($0-$29/month)
- HIPAA-compliant with multi-layer encryption
- **Takeaway:** Community templates + sharing increases adoption

#### TherapyNotes
- Purpose-built for behavioral health (60,000+ users)
- Integrated SOAP notes
- Focus on documentation speed
- **Takeaway:** Purpose-built templates > generic WYSIWYG

#### DocuSeal (Open Source)
- Full document signing solution
- Embeddable React components
- $0.20 per document completion
- **Takeaway:** Consider e-signature as separate module

### 2.2 Editor Library Comparison

| Feature | TipTap | Plate.js | Lexical | **Current GLRS** |
|---------|--------|----------|---------|------------------|
| Foundation | ProseMirror | Slate | Meta engine | Custom |
| React Support | Excellent | Excellent | Good | Custom |
| TypeScript | Full | Full | Full | None |
| Block System | Extensions | Plugins | Nodes | Custom |
| Tables | Extension | Plugin | Plugin | N/A |
| Drag-Drop | Extension | Built-in | Manual | Custom |
| Collaborative | Yjs/Liveblocks | Yjs | Built-in | N/A |
| Learning Curve | Medium | High | High | N/A |
| Documentation | Excellent | Good | Fair | N/A |
| License | MIT | MIT | MIT | N/A |

#### TipTap (Recommended)
**Pros:**
- Built on battle-tested ProseMirror
- Excellent React integration
- Modular extension system
- Strong community and documentation
- Collaborative editing support

**Cons:**
- Pro features require payment
- Some learning curve for ProseMirror concepts

#### Plate.js
**Pros:**
- Built on Slate (flexible)
- Extensive plugin ecosystem
- Good for custom editing experiences

**Cons:**
- Android support is limited
- Steeper learning curve
- Sparse documentation

#### Lexical
**Pros:**
- Lightweight and performant
- Strong TypeScript support
- Cross-platform (iOS native)
- Backed by Meta

**Cons:**
- Limited documentation
- Younger ecosystem
- No IE11 support

### 2.3 Best Practices

#### Template Variables/Placeholders
- Use Handlebars-style syntax: `{{client.name}}`
- Separate data schema from template content
- Allow default values: `{{date|today}}`
- Validation before rendering

#### Preview Functionality
- Real-time preview in split pane
- Responsive preview (desktop/mobile)
- Print preview mode
- PDF preview before export

#### PDF Export Best Practices
- **html2canvas + jsPDF:** Good for simple documents, text becomes images
- **React-PDF:** Vector text, searchable PDFs
- **@react-pdf/renderer:** Custom PDF layouts
- **Server-side (Puppeteer):** Most accurate, complex setup

#### Template Organization
- Categories with icons
- Search and filter
- Favorites/frequently used
- Template versioning
- Archive vs delete

### 2.4 Reference Implementations

#### TipTap + Tailwind Examples
- [TipTap Templates](https://tiptap.dev/templates) - Official starter templates
- [Novel Editor](https://github.com/steven-tey/novel) - Notion-like editor with TipTap
- [BlockNote](https://www.blocknotejs.org/) - Block-based editor

#### Document Signing
- [DocuSeal](https://github.com/docusealco/docuseal) - Open source e-signature
- [Anvil](https://www.useanvil.com/) - Embeddable e-signature

---

## 3. Migration Strategy

### 3.1 Recommended Editor Library

**Recommendation: Custom Block System (Keep Current Architecture)**

**Rationale:**
1. **Signature Field Types:** TipTap/Plate don't have native signature field blocks. Would need extensive custom extensions.
2. **Pagination Requirements:** Real-time page breaks require custom logic that integrates tightly with rendering.
3. **Shared Code with sign.html:** Must maintain compatibility with existing viewer.
4. **E-Signature Workflow:** Tightly coupled with block system.
5. **Working System:** Current system works; migration risk is high.

**Alternative Approach:**
Instead of adopting a new editor library, **modernize the existing architecture**:
- Extract to TypeScript modules
- Add shadcn/ui components
- Keep GLRS_DOC/STYLES/RENDERER pattern
- Convert to React hooks

### 3.2 Component Structure

```
/src/pages/templates/
├── Templates.tsx              # Main page component
├── types.ts                   # TypeScript interfaces
├── constants.ts               # Block types, signer roles
├── hooks/
│   ├── useTemplates.ts        # Template CRUD operations
│   ├── useAgreements.ts       # Agreement operations
│   ├── useBlockEditor.ts      # Block management state
│   └── usePagination.ts       # Pagination logic
├── components/
│   ├── TemplateList/
│   │   ├── TemplateCard.tsx
│   │   ├── TemplateFilters.tsx
│   │   └── EmptyState.tsx
│   ├── Editor/
│   │   ├── EditorLayout.tsx
│   │   ├── BlockPalette.tsx
│   │   ├── EditorCanvas.tsx
│   │   ├── CanvasBlock.tsx
│   │   ├── BlockPropertiesPanel.tsx
│   │   └── DocumentPropertiesPanel.tsx
│   ├── Preview/
│   │   ├── PagePreview.tsx
│   │   ├── CoverPage.tsx
│   │   ├── PageHeader.tsx
│   │   ├── PageFooter.tsx
│   │   └── EndPage.tsx
│   ├── Signing/
│   │   ├── SendForSignatureModal.tsx
│   │   ├── SignatureCanvas.tsx
│   │   └── SignerForm.tsx
│   └── Modals/
│       ├── TemplateCreateModal.tsx
│       ├── TemplateDetailModal.tsx
│       ├── DeleteConfirmModal.tsx
│       ├── CoverPageEditorModal.tsx
│       ├── HeaderEditorModal.tsx
│       ├── FooterEditorModal.tsx
│       └── EndPageEditorModal.tsx
├── utils/
│   ├── blockRenderer.ts       # Block rendering logic
│   ├── pagination.ts          # Pagination algorithm
│   ├── pdfExport.ts           # PDF generation
│   └── documentConversion.ts  # PDF/DOCX conversion
└── lib/
    ├── styles.ts              # Block styles (from GLRS_STYLES)
    └── constants.ts           # Document constants (from GLRS_DOC)
```

### 3.3 Feature Parity Checklist

#### Phase A: Core Infrastructure
- [ ] TypeScript types for all entities
- [ ] Block types enum and definitions
- [ ] Signer roles definitions
- [ ] Document constants (page dimensions, heights)
- [ ] Block styles module
- [ ] Firebase hooks (useTemplates, useAgreements)

#### Phase B: Template List View
- [ ] TemplatesView component
- [ ] TemplateCard component
- [ ] EmptyState component
- [ ] Search and filter functionality
- [ ] Category filter
- [ ] SkeletonCard loading state

#### Phase C: Template CRUD
- [ ] TemplateCreateModal
- [ ] TemplateDetailModal
- [ ] DeleteConfirmModal
- [ ] Duplicate template function
- [ ] Template status management

#### Phase D: Block Editor (Core)
- [ ] EditorLayout (3-panel layout)
- [ ] BlockPalette (drag source)
- [ ] EditorCanvas (drop target)
- [ ] CanvasBlock (individual blocks)
- [ ] Block selection state
- [ ] Block add/delete/move operations
- [ ] Auto-save with debounce

#### Phase E: Block Properties
- [ ] BlockPropertiesPanel container
- [ ] Section block properties
- [ ] Heading block properties
- [ ] Paragraph block properties
- [ ] BulletList block properties
- [ ] SignatureField properties
- [ ] InitialsField properties
- [ ] DateField properties
- [ ] TextInputField properties
- [ ] CheckboxField properties
- [ ] DropdownField properties
- [ ] PageBreak properties

#### Phase F: Document Components
- [ ] CoverPageEditorModal
- [ ] HeaderEditorModal
- [ ] FooterEditorModal
- [ ] EndPageEditorModal
- [ ] DocumentPropertiesPanel
- [ ] Component selector dropdowns

#### Phase G: Preview & Pagination
- [ ] Pagination algorithm (paginateBlocks)
- [ ] Block height calculation
- [ ] PagePreview component
- [ ] CoverPage component
- [ ] PageHeader component
- [ ] PageFooter component
- [ ] EndPage component
- [ ] Preview mode toggle

#### Phase H: Document Upload
- [ ] UploadDocumentModal
- [ ] PDF conversion (pdf.js)
- [ ] DOCX conversion (mammoth)
- [ ] Image upload to Storage
- [ ] UploadedDocumentEditor
- [ ] DraggableField overlay

#### Phase I: E-Signature Workflow
- [ ] SendForSignatureModal
- [ ] Signer form validation
- [ ] Role-based signing order
- [ ] Email notification (mail collection)
- [ ] SignatureCanvas component
- [ ] GLRSSigningModal
- [ ] Field value capture
- [ ] Agreement creation
- [ ] SendSuccessModal

#### Phase J: Agreements View
- [ ] AgreementsView component
- [ ] AgreementRow component
- [ ] Agreement status badges
- [ ] Copy signing link
- [ ] Void agreement
- [ ] Sign as GLRS
- [ ] Download PDF
- [ ] Real-time status updates

### 3.4 Implementation Phases

#### Phase 1: Foundation (Week 1)
**Scope:** Types, constants, basic structure
- Create `/src/pages/templates/` directory structure
- Define TypeScript interfaces (Template, Agreement, Block, Signer)
- Port document constants (GLRS_DOC → constants.ts)
- Port block styles (GLRS_STYLES → styles.ts)
- Create basic Templates.tsx shell
- Add route in router

**Deliverables:** TypeScript foundation, empty page renders

#### Phase 2: Template List (Week 2)
**Scope:** TemplatesView with read-only functionality
- TemplateCard component (shadcn Card)
- Template grid layout
- Category filter (shadcn Select)
- Search functionality
- EmptyState component
- Loading skeleton
- Firebase query integration

**Deliverables:** Can view and filter existing templates

#### Phase 3: Template CRUD (Week 2-3)
**Scope:** Create, edit metadata, delete templates
- TemplateCreateModal (shadcn Dialog)
- TemplateDetailModal
- DeleteConfirmModal (shadcn AlertDialog)
- Duplicate template function
- Status toggle (draft/active/archived)
- Icon/color picker

**Deliverables:** Can create, view details, delete templates

#### Phase 4: Block Editor Core (Week 3-4)
**Scope:** Drag-and-drop block editing
- EditorLayout (3-panel with resize)
- BlockPalette (drag source)
- EditorCanvas (drop target)
- CanvasBlock component
- Block selection
- Add block (from palette)
- Delete block
- Reorder blocks (drag within canvas)
- Auto-save with debounce

**Deliverables:** Can add, remove, reorder blocks

#### Phase 5: Block Properties (Week 4-5)
**Scope:** Edit individual block properties
- BlockPropertiesPanel container
- Properties forms for each block type:
  - Structure: section, heading, pageBreak
  - Content: paragraph, bulletList
  - Signature: all 7 field types
- Role selector for signature fields
- Required toggle

**Deliverables:** Can edit all block properties

#### Phase 6: Document Structure (Week 5)
**Scope:** Cover, header, footer, end page
- Document properties panel
- Component selector (cover, header, footer, end)
- CoverPageEditorModal
- HeaderEditorModal
- FooterEditorModal
- EndPageEditorModal
- Component loading/preview

**Deliverables:** Can configure document structure

#### Phase 7: Preview & Pagination (Week 6)
**Scope:** Real-time preview with pagination
- Port pagination algorithm
- Block height calculation
- PagePreview component
- Cover/Header/Footer/EndPage rendering
- Preview mode toggle
- Page navigation

**Deliverables:** Accurate WYSIWYG preview

#### Phase 8: Document Upload (Week 6-7)
**Scope:** PDF/DOCX upload and overlay
- UploadDocumentModal
- PDF.js integration
- Mammoth.js integration
- Storage upload
- UploadedDocumentEditor
- DraggableField component
- Field positioning (percentage-based)

**Deliverables:** Can upload and annotate documents

#### Phase 9: E-Signature Send (Week 7-8)
**Scope:** Send documents for signature
- SendForSignatureModal
- Signer information forms
- Validation (required fields)
- Role ordering logic
- Agreement creation in Firestore
- Email notification trigger

**Deliverables:** Can send templates for signature

#### Phase 10: Signing Interface (Week 8)
**Scope:** Signature capture
- GLRSSigningModal
- SignatureCanvas (touch/mouse)
- Field renderer (by role)
- Value capture and storage
- Agreement status update
- Completion flow

**Deliverables:** Can sign agreements

#### Phase 11: Agreements Management (Week 9)
**Scope:** View and manage agreements
- AgreementsView component
- AgreementRow component
- Status badges
- Copy link functionality
- Void agreement
- Sign as GLRS
- Real-time updates (onSnapshot)

**Deliverables:** Full agreements management

#### Phase 12: Polish & Testing (Week 9-10)
**Scope:** Bug fixes, responsive, testing
- Responsive design refinement
- Loading states
- Error handling
- Mobile testing
- Cross-browser testing
- sign.html compatibility verification

**Deliverables:** Production-ready templates system

### 3.5 Estimated Scope

| Phase | Description | Est. Hours |
|-------|-------------|------------|
| 1 | Foundation | 8-12 |
| 2 | Template List | 12-16 |
| 3 | Template CRUD | 8-12 |
| 4 | Block Editor Core | 20-28 |
| 5 | Block Properties | 16-24 |
| 6 | Document Structure | 12-16 |
| 7 | Preview & Pagination | 16-20 |
| 8 | Document Upload | 12-16 |
| 9 | E-Signature Send | 16-20 |
| 10 | Signing Interface | 16-20 |
| 11 | Agreements Management | 12-16 |
| 12 | Polish & Testing | 12-16 |
| **TOTAL** | | **160-216 hours** |

**Timeline:** 8-10 weeks at 20-24 hours/week

---

## 4. Appendix

### 4.1 Current templates.html Section Map

| Lines | Component/Section |
|-------|-------------------|
| 1-70 | External dependencies (CDN) |
| 71-150 | Shared library imports |
| 150-320 | PDF/DOCX conversion functions |
| 321-644 | UploadDocumentModal |
| 649-799 | DraggableField |
| 803-1169 | UploadedDocumentEditor |
| 1170-1221 | (Utility functions) |
| 1222-1341 | IconPicker |
| 1345-1398 | SkeletonCard |
| 1402-1489 | EmptyState |
| 1493-1729 | TemplateCard |
| 1733-1892 | DeleteConfirmModal |
| 1896-2340 | TemplateCreateModal |
| 2344-2915 | TemplateDetailModal |
| 2916-3050 | BLOCK_TYPES, SIGNER_ROLES |
| 3052-3493 | Service agreement import utility |
| 3497-4512 | TemplateEditorModal |
| 4516-4856 | CoverPageEditorModal |
| 4860-5085 | HeaderEditorModal |
| 5089-5314 | FooterEditorModal |
| 5318-5578 | EndPageEditorModal |
| 5582-5644 | PaletteBlock |
| 5648-6166 | CanvasBlock |
| 6167-6403 | Editor preview components |
| 6407-7632 | BlockPropertiesPanel |
| 7636-7859 | DocumentPropertiesPanel |
| 7860-8542 | (Additional utility functions) |
| 8546-9439 | SendForSignatureModal |
| 9443-9993 | GLRSSigningModal |
| 9997-10186 | SendSuccessModal |
| 10187-10199 | (Divider) |
| 10203-10673 | AgreementRow |
| 10674-11193 | (Additional agreement functions) |
| 11194-11630 | AgreementsView |
| 11631-12329 | TemplatesView |
| 12330-12594 | App (main component) |

### 4.2 Firebase Collections Used

| Collection | Document Schema | Used By |
|------------|-----------------|---------|
| `templates` | Template | TemplatesView, all editors |
| `agreements` | Agreement | AgreementsView, signing modals |
| `mail` | Email object | SendForSignatureModal |
| `users` | User | Auth, signer info |

### 4.3 External Resources/Links

#### Editor Libraries
- [TipTap Documentation](https://tiptap.dev/docs)
- [Plate.js](https://platejs.org/)
- [Lexical](https://lexical.dev/)
- [ProseMirror](https://prosemirror.net/)

#### E-Signature Solutions
- [DocuSeal (Open Source)](https://www.docuseal.com/)
- [Anvil E-Signature](https://www.useanvil.com/)
- [DocuSign Developer](https://developers.docusign.com/)

#### PDF Generation
- [jsPDF GitHub](https://github.com/parallax/jsPDF)
- [html2canvas](https://html2canvas.hertzen.com/)
- [React-PDF](https://react-pdf.org/)

#### Industry Comparisons
- [SimplePractice vs Carepatron](https://www.mentalyc.com/blog/carepatron-vs-simplepractice)
- [Best EHR for Therapists](https://headway.co/resources/best-ehr-for-therapists)
- [Rich Text Editor Comparison 2025](https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025)

---

## 5. Recommendations

### Critical Decisions Required

1. **Editor Library:** Recommend keeping custom system vs adopting TipTap
   - Current system works and is tightly integrated
   - Migration risk is high for limited benefit
   - TypeScript conversion provides most value

2. **sign.html Compatibility:** Must maintain shared code
   - GLRS_DOC, GLRS_STYLES, GLRS_RENDERER must remain
   - Consider: Keep as separate JS files vs bundle into TypeScript

3. **Phased vs Big Bang:** Recommend phased approach
   - Lower risk
   - Can validate each phase
   - Allows parallel development

4. **E-Signature Scope:** Consider keeping in templates.html initially
   - Highest complexity
   - Works currently
   - Migrate after templates stabilize

### Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| sign.html breaks | Medium | High | Keep shared libs, test thoroughly |
| Pagination differs | Medium | High | Port algorithm exactly, add tests |
| Signature canvas issues | Low | Medium | Use existing canvas code |
| PDF export quality | Medium | Medium | Keep current html2canvas approach |

---

**Document Complete**

Awaiting approval before beginning Templates.tsx implementation.
