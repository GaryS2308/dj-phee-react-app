'use client';

import { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_DOCUMENT_TEMPLATE,
  STARTER_QUOTE_SERVICES,
  normalizeDocumentTemplate,
  normalizeQuoteService
} from '../../../lib/adminDataShapes';
import { dateLabel, money, uid } from '../../../lib/adminUtils';
import { deleteDocumentTemplate, listenToDocumentTemplates, saveDocumentTemplate } from '../../../lib/firestore/documentTemplates';
import { deleteQuoteService, listenToQuoteServices, saveQuoteService } from '../../../lib/firestore/quoteServices';

const EMPTY_SERVICE = {
  name: '',
  category: '',
  unit: 'items',
  defaultQty: 1,
  unitPrice: 0,
  description: ''
};

const SERVICE_CATEGORIES = ['', 'DJ Sets', 'Sound', 'Lighting', 'Other'];
const SERVICE_UNITS = ['hours', 'quantity', 'days', 'sets', 'items'];

const TEMPLATE_FIELDS = [
  ['name', 'Template name'],
  ['businessName', 'Business name'],
  ['roleTitle', 'Role'],
  ['logoUrl', 'Logo URL'],
  ['businessEmail', 'Business email'],
  ['businessPhone', 'Business phone'],
  ['bankName', 'Bank name'],
  ['accountHolder', 'Account holder'],
  ['accountNumber', 'Account number'],
  ['branchCode', 'Branch code'],
  ['bicSwiftCode', 'BIC / SWIFT code']
];

const TEMPLATE_COLOR_FIELDS = [
  ['accentColor', 'Accent line'],
  ['documentBackground', 'Page background'],
  ['headerBackground', 'Header background'],
  ['headerTextColor', 'Header text'],
  ['bodyTextColor', 'Body text'],
  ['labelColor', 'Label text'],
  ['panelBackground', 'Client/event boxes'],
  ['panelBorderColor', 'Box/table lines'],
  ['tableHeaderBackground', 'Table header'],
  ['tableHeaderTextColor', 'Table header text'],
  ['totalsBackground', 'Totals box'],
  ['totalsTextColor', 'Totals text']
];

const TEMPLATE_TEXT_FIELDS = [
  ['documentEyebrow', 'Header eyebrow'],
  ['invoiceTitle', 'Invoice title'],
  ['quotationTitle', 'Quotation title'],
  ['clientSectionTitle', 'Client section'],
  ['eventSectionTitle', 'Event section'],
  ['servicesSectionTitle', 'Services section'],
  ['termsSectionTitle', 'Terms section'],
  ['notesSectionTitle', 'Notes section'],
  ['bankDetailsSectionTitle', 'Bank details section'],
  ['issuedLabel', 'Issued label'],
  ['dueLabel', 'Due label'],
  ['validUntilLabel', 'Valid until label'],
  ['quoteReferenceLabel', 'Quote reference label'],
  ['serviceColumnLabel', 'Service column'],
  ['unitColumnLabel', 'Units column'],
  ['rateColumnLabel', 'Rate column'],
  ['amountColumnLabel', 'Amount column'],
  ['subtotalLabel', 'Subtotal label'],
  ['discountLabel', 'Discount label'],
  ['depositDueLabel', 'Deposit label'],
  ['balanceDueLabel', 'Balance label'],
  ['quoteTotalLabel', 'Quote total label'],
  ['invoiceTotalLabel', 'Invoice total label']
];

const TEMPLATE_WORDING_GROUPS = [
  {
    title: 'Header and sections',
    fields: [
      ['documentEyebrow', 'Header eyebrow'],
      ['invoiceTitle', 'Invoice title'],
      ['quotationTitle', 'Quotation title'],
      ['clientSectionTitle', 'Client section'],
      ['eventSectionTitle', 'Event section'],
      ['servicesSectionTitle', 'Services section'],
      ['termsSectionTitle', 'Terms section'],
      ['notesSectionTitle', 'Notes section'],
      ['bankDetailsSectionTitle', 'Bank details section']
    ]
  },
  {
    title: 'Dates and references',
    fields: [
      ['issuedLabel', 'Issued label'],
      ['dueLabel', 'Due label'],
      ['validUntilLabel', 'Valid until label'],
      ['quoteReferenceLabel', 'Quote reference label']
    ]
  },
  {
    title: 'Table and totals',
    fields: [
      ['serviceColumnLabel', 'Service column'],
      ['unitColumnLabel', 'Units column'],
      ['rateColumnLabel', 'Rate column'],
      ['amountColumnLabel', 'Amount column'],
      ['subtotalLabel', 'Subtotal label'],
      ['discountLabel', 'Discount label'],
      ['depositDueLabel', 'Deposit label'],
      ['balanceDueLabel', 'Balance label'],
      ['quoteTotalLabel', 'Quote total label'],
      ['invoiceTotalLabel', 'Invoice total label']
    ]
  }
];

const PREVIEW_ITEMS = [
  { id: 'preview-dj', name: 'DJ Performance', quantity: 3, unit: 'hours', unitPrice: 2500, total: 7500 },
  { id: 'preview-sound', name: 'Sound System', quantity: 1, unit: 'items', unitPrice: 4500, total: 4500 },
  { id: 'preview-lighting', name: 'Lighting Package', quantity: 1, unit: 'items', unitPrice: 3200, total: 3200 }
];

function templateText(template, key, fallback) {
  return template?.[key] === undefined || template?.[key] === null ? fallback : template[key];
}

function previewFocusClass(activeField, fields) {
  return fields.includes(activeField) ? ' admin-preview-focus' : '';
}

function documentStyle(template) {
  return {
    '--doc-accent': template.accentColor,
    '--doc-bg': template.documentBackground,
    '--doc-header-bg': template.headerBackground,
    '--doc-header-text': template.headerTextColor,
    '--doc-body-text': template.bodyTextColor,
    '--doc-label': template.labelColor,
    '--doc-panel-bg': template.panelBackground,
    '--doc-panel-border': template.panelBorderColor,
    '--doc-table-header-bg': template.tableHeaderBackground,
    '--doc-table-header-text': template.tableHeaderTextColor,
    '--doc-totals-bg': template.totalsBackground,
    '--doc-totals-text': template.totalsTextColor
  };
}

function TemplatePreview({ template, activeField = '' }) {
  const activeTemplate = normalizeDocumentTemplate(template?.id, template || DEFAULT_DOCUMENT_TEMPLATE);
  const subtotal = PREVIEW_ITEMS.reduce((sum, item) => sum + item.total, 0);
  const depositDue = Math.round(subtotal * 0.5);

  return (
    <article className="admin-document-preview admin-document-preview--settings" style={documentStyle(activeTemplate)}>
      <section className={`admin-document-preview__top${previewFocusClass(activeField, ['logoUrl', 'businessName', 'roleTitle', 'documentEyebrow', 'quotationTitle', 'issuedLabel', 'validUntilLabel'])}`}>
        <div className="admin-document-preview__top-left">
          <div className={`admin-document-preview__logo${previewFocusClass(activeField, ['logoUrl'])}`}>
            {activeTemplate.logoUrl ? <img src={activeTemplate.logoUrl} alt="" /> : activeTemplate.businessName.slice(0, 1)}
          </div>
          <div>
            <span className={`admin-document-preview__kicker${previewFocusClass(activeField, ['documentEyebrow'])}`}>{templateText(activeTemplate, 'documentEyebrow', 'Performance Agreement')}</span>
            <h2 className={previewFocusClass(activeField, ['businessName'])}>{activeTemplate.businessName}</h2>
            <p className={previewFocusClass(activeField, ['roleTitle'])}>{activeTemplate.roleTitle}</p>
          </div>
        </div>
        <div className="admin-document-preview__top-right">
          <h3 className={previewFocusClass(activeField, ['quotationTitle'])}>{templateText(activeTemplate, 'quotationTitle', 'Quotation')}</h3>
          <p><strong>QUO-2026-0001</strong><br /><span className={previewFocusClass(activeField, ['issuedLabel'])}>{templateText(activeTemplate, 'issuedLabel', 'Issued')}</span> {dateLabel('2026-05-12')}<br /><span className={previewFocusClass(activeField, ['validUntilLabel'])}>{templateText(activeTemplate, 'validUntilLabel', 'Valid until')}</span> {dateLabel('2026-05-26')}</p>
        </div>
      </section>

      <section className="admin-document-preview__split">
        <div className={previewFocusClass(activeField, ['clientSectionTitle'])}>
          <span>{templateText(activeTemplate, 'clientSectionTitle', 'Billed to')}</span>
          <p><strong>Gary Strybis</strong><br />Strydes<br />garyjohnstrybis@gmail.com<br />0780750397</p>
        </div>
        <div className={previewFocusClass(activeField, ['eventSectionTitle'])}>
          <span>{templateText(activeTemplate, 'eventSectionTitle', 'Event')}</span>
          <p><strong>Wedding</strong><br />2026/05/13<br />Buiten<br />3 hours</p>
        </div>
      </section>

      <div className={`admin-document-preview__services-label${previewFocusClass(activeField, ['servicesSectionTitle'])}`}>{templateText(activeTemplate, 'servicesSectionTitle', 'Services')}</div>
      <table className="admin-document-preview__table">
        <thead>
          <tr><th className={previewFocusClass(activeField, ['serviceColumnLabel'])} style={{textAlign:'left'}}>{templateText(activeTemplate, 'serviceColumnLabel', 'Service')}</th><th className={previewFocusClass(activeField, ['unitColumnLabel'])}>{templateText(activeTemplate, 'unitColumnLabel', 'Units')}</th><th className={previewFocusClass(activeField, ['rateColumnLabel'])}>{templateText(activeTemplate, 'rateColumnLabel', 'Rate')}</th><th className={previewFocusClass(activeField, ['amountColumnLabel'])}>{templateText(activeTemplate, 'amountColumnLabel', 'Total')}</th></tr>
        </thead>
        <tbody>
          {PREVIEW_ITEMS.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.name}</strong></td>
              <td>{item.quantity} {item.unit}</td>
              <td>{money(item.unitPrice)}</td>
              <td>{money(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="admin-document-preview__totals">
        <p className={previewFocusClass(activeField, ['subtotalLabel'])}><span>{templateText(activeTemplate, 'subtotalLabel', 'Subtotal')}</span><strong>{money(subtotal)}</strong></p>
        <p className={previewFocusClass(activeField, ['depositDueLabel'])}><span>{templateText(activeTemplate, 'depositDueLabel', 'Deposit due')}</span><strong>{money(depositDue)}</strong></p>
        <p className={`admin-document-preview__grand-total${previewFocusClass(activeField, ['quoteTotalLabel', 'invoiceTotalLabel'])}`}><span>{templateText(activeTemplate, 'quoteTotalLabel', 'Quote total')}</span><strong>{money(subtotal)}</strong></p>
      </section>

      <div className="admin-settings-preview__bottom">
        {(activeTemplate.bankName || activeTemplate.accountNumber) && (
          <section className={`admin-document-preview__terms${previewFocusClass(activeField, ['bankDetailsSectionTitle', 'bankName', 'accountHolder', 'accountNumber', 'branchCode', 'bicSwiftCode'])}`}>
            <span className={previewFocusClass(activeField, ['bankDetailsSectionTitle'])}>{templateText(activeTemplate, 'bankDetailsSectionTitle', 'Bank Details')}</span>
            <p><span className={previewFocusClass(activeField, ['bankName'])}>{activeTemplate.bankName}</span><br /><span className={previewFocusClass(activeField, ['accountHolder'])}>{activeTemplate.accountHolder}</span><br /><span className={previewFocusClass(activeField, ['accountNumber'])}>{activeTemplate.accountNumber || 'Account number'}</span><br /><span className={previewFocusClass(activeField, ['branchCode'])}>{activeTemplate.branchCode || 'Branch code'}</span><br /><span className={previewFocusClass(activeField, ['bicSwiftCode'])}>{activeTemplate.bicSwiftCode || 'BIC / SWIFT code'}</span></p>
          </section>
        )}
        <section className={`admin-document-preview__terms${previewFocusClass(activeField, ['termsSectionTitle', 'quotationTerms', 'invoiceTerms'])}`}>
          <span className={previewFocusClass(activeField, ['termsSectionTitle'])}>{templateText(activeTemplate, 'termsSectionTitle', 'Terms')}</span>
          <p className={previewFocusClass(activeField, ['quotationTerms', 'invoiceTerms'])}>{activeTemplate.quotationTerms}</p>
        </section>
      </div>

      <footer className={`admin-document-preview__footer${previewFocusClass(activeField, ['footerNote'])}`}>
        <span>{activeTemplate.businessName}</span>
        <span>{templateText(activeTemplate, 'footerNote', 'Prepared with availability subject to confirmation.')}</span>
      </footer>
    </article>
  );
}

function upsertRecord(records, record) {
  return [record, ...records.filter((item) => item.id !== record.id)];
}

function SavedServicesSection() {
  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [draft, setDraft] = useState(EMPTY_SERVICE);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const seededRef = useRef(false);

  useEffect(() => {
    const unsubscribe = listenToQuoteServices(
      async (records) => {
        setServices(records);
        if (!records.length && !seededRef.current) {
          seededRef.current = true;
          const seeded = await Promise.all(STARTER_QUOTE_SERVICES.map((service) => saveQuoteService(service)));
          setServices(seeded.map((service) => normalizeQuoteService(service.id, service)));
        }
      },
      (error) => setStatus(`Saved services are using local fallback: ${error.message || 'Firestore unavailable.'}`)
    );
    return unsubscribe;
  }, []);

  const editService = (service) => {
    setEditingId(service.id);
    setDraft(service);
    setShowForm(true);
  };
  const closeForm = () => {
    setEditingId('');
    setDraft(EMPTY_SERVICE);
    setShowForm(false);
    setStatus('');
  };
  const resetForm = () => {
    setEditingId('');
    setDraft(EMPTY_SERVICE);
    setShowForm(true);
    setStatus('');
  };
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus('Saving service...');
    try {
      const saved = await saveQuoteService({ ...draft, id: editingId || draft.id });
      const normalized = normalizeQuoteService(saved.id, saved);
      setServices((current) => upsertRecord(current, normalized));
      setEditingId('');
      setDraft(EMPTY_SERVICE);
      setShowForm(false);
      const savedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setStatus(saved.savedLocally ? `Saved service locally at ${savedAt}.` : `Saved service at ${savedAt}.`);
    } catch (error) {
      setStatus(`Could not save service: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };
  const remove = async (service) => {
    if (!window.confirm(`Delete saved service "${service.name}"? This cannot be undone.`)) return;
    await deleteQuoteService(service.id);
    setServices((current) => current.filter((item) => item.id !== service.id));
    if (editingId === service.id) resetForm();
    setStatus('Deleted saved service.');
  };

  return (
    <section className="admin-panel admin-panel--wide">
      <div className="admin-panel__title">
        <div className="admin-panel__intro">
          <h2>Saved Services</h2>
          <p>Reusable service rows for future quotations and invoices.</p>
        </div>
        <button type="button" onClick={resetForm}>New service</button>
      </div>
      {status && <p className="admin-alert">{status}</p>}
      <div className="admin-template-layout">
        <aside className="admin-template-list">
          {services.map((service) => (
            <button type="button" key={service.id} className={service.id === editingId ? 'is-active' : ''} onClick={() => editService(service)}>
              <span>{service.name}</span>
              <small>{service.category || 'Service'} - {money(service.unitPrice)}/{service.unit}</small>
            </button>
          ))}
          {!services.length && <p className="admin-empty">No saved services yet</p>}
        </aside>
        {showForm && (
          <div className="admin-service-form-wrap">
            <div className="admin-service-form-header">
              <span>{editingId ? 'Edit service' : 'New service'}</span>
              <button type="button" className="admin-service-form-close" onClick={closeForm} aria-label="Close">×</button>
            </div>
            <form className="admin-template-form admin-service-settings-form" onSubmit={save}>
              <label>Service name
                <input value={draft.name} onChange={(event) => update('name', event.target.value)} placeholder="Sound System" required />
                <small>The name that appears as a saved quote or invoice line item.</small>
              </label>
              <label>Category
                <select value={draft.category} onChange={(event) => update('category', event.target.value)}>
                  {SERVICE_CATEGORIES.map((category) => (
                    <option key={category || 'new'} value={category}>{category || 'New'}</option>
                  ))}
                </select>
                <small>Use New for a new service line, or group it under DJ Sets, Sound, Lighting, or Other.</small>
              </label>
              <label>Unit
                <select value={draft.unit} onChange={(event) => update('unit', event.target.value)}>
                  {SERVICE_UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                </select>
                <small>This controls the wording in the Units column.</small>
              </label>
              <label>Default quantity
                <input type="number" min="0" step="0.5" value={draft.defaultQty} onChange={(event) => update('defaultQty', event.target.value)} />
                <small>The quantity added automatically when selecting this service.</small>
              </label>
              <label>Unit price
                <input type="number" min="0" step="100" value={draft.unitPrice} onChange={(event) => update('unitPrice', event.target.value)} />
                <small>The arrows move by R100, but you can still type any exact amount.</small>
              </label>
              <label className="admin-template-form__wide">Description
                <textarea value={draft.description} onChange={(event) => update('description', event.target.value)} placeholder="Optional detail shown under the service name." />
              </label>
              <div className="admin-template-form__actions">
                <button type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create service'}</button>
                {editingId && <button type="button" className="admin-danger-btn" onClick={() => remove(draft)}>Delete</button>}
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

function CollapsibleCard({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`admin-settings-card admin-settings-card--collapsible${open ? ' is-open' : ''}`}>
      <button type="button" className="admin-settings-card__toggle" onClick={() => setOpen((v) => !v)}>
        <h3>{title}</h3>
        <span className="admin-settings-card__chevron" aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="admin-settings-card__body">{children}</div>}
    </section>
  );
}

function DocumentTemplatesSection() {
  const [templates, setTemplates] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [draft, setDraft] = useState(DEFAULT_DOCUMENT_TEMPLATE);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTemplateField, setActiveTemplateField] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const seededRef = useRef(false);
  const editingIdRef = useRef('');

  const setActiveTemplate = (template, open = false) => {
    editingIdRef.current = template.id;
    setEditingId(template.id);
    setDraft(template);
    if (open) setShowEditor(true);
  };
  const closeEditor = () => {
    setShowEditor(false);
    setStatus('');
  };

  useEffect(() => {
    const unsubscribe = listenToDocumentTemplates(
      async (records) => {
        const normalized = ensureSingleDefault(records);
        setTemplates(normalized);
        if (normalized[0] && !editingIdRef.current) {
          setActiveTemplate(normalized[0]);
        }
        if (!records.length && !seededRef.current) {
          seededRef.current = true;
          const saved = await saveDocumentTemplate(DEFAULT_DOCUMENT_TEMPLATE);
          const next = normalizeDocumentTemplate(saved.id, saved);
          setTemplates([next]);
          setActiveTemplate(next);
        }
      },
      (error) => setStatus(`Document templates are using local fallback: ${error.message || 'Firestore unavailable.'}`)
    );
    return unsubscribe;
  }, []);

  const editTemplate = (template) => {
    setActiveTemplate(template, true);
  };
  const newTemplate = () => {
    const next = normalizeDocumentTemplate(uid(), { ...DEFAULT_DOCUMENT_TEMPLATE, name: 'New template', isDefault: !templates.length });
    setActiveTemplate(next, true);
    setStatus('New template ready. Save it when the preview looks right.');
  };
  const update = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setStatus('Unsaved changes.');
  };
  const templateInputProps = (key) => ({
    onFocus: () => setActiveTemplateField(key)
  });
  const persistTemplate = async (template) => {
    setSaving(true);
    setStatus('Saving template...');
    try {
      const saved = await saveDocumentTemplate(template);
      const normalized = normalizeDocumentTemplate(saved.id, saved);
      setTemplates((current) => {
        const next = upsertRecord(current, normalized);
        return normalized.isDefault ? next.map((item) => ({ ...item, isDefault: item.id === normalized.id })) : ensureSingleDefault(next);
      });
      setActiveTemplate(normalized);
      setShowEditor(false);
      const savedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setStatus(saved.savedLocally ? `Saved locally at ${savedAt}. Firestore permissions can sync it later.` : `Saved to Firestore at ${savedAt}.`);
    } catch (error) {
      setStatus(`Could not save template: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };
  const save = async (event) => {
    event.preventDefault();
    await persistTemplate(draft);
  };
  const duplicate = async () => {
    await persistTemplate({ ...draft, id: uid(), name: `${draft.name} copy`, isDefault: false });
  };
  const setDefault = async () => {
    setSaving(true);
    setStatus('Updating default template...');
    const target = { ...draft, isDefault: true };
    const nextTemplates = upsertRecord(templates, target).map((template) => ({ ...template, isDefault: template.id === target.id }));
    try {
      setTemplates(nextTemplates);
      await Promise.all(nextTemplates.map((template) => saveDocumentTemplate(template)));
      setActiveTemplate(target);
      setStatus('Default template updated and saved.');
    } catch (error) {
      setStatus(`Could not update default template: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!window.confirm(`Delete document template "${draft.name}"? This cannot be undone.`)) return;
    const wasDefault = draft.isDefault;
    await deleteDocumentTemplate(draft.id);
    const remaining = templates.filter((template) => template.id !== draft.id);
    const next = ensureSingleDefault(remaining);
    setTemplates(next);
    if (next[0]) {
      setActiveTemplate(next[0]);
      if (wasDefault) await saveDocumentTemplate({ ...next[0], isDefault: true });
    } else {
      newTemplate();
    }
    setStatus('Deleted document template.');
  };

  return (
    <section className="admin-panel admin-panel--wide">
      <div className="admin-panel__title">
        <div className="admin-panel__intro">
          <h2>Document Templates</h2>
          <p>Business, banking, accent, and terms details for future quotes and invoices.</p>
        </div>
        <div className="admin-panel__actions">
          {showEditor ? (
            <>
              <button type="button" onClick={duplicate}>Duplicate</button>
              <button type="button" className="admin-template-close-btn" onClick={closeEditor} aria-label="Close">×</button>
            </>
          ) : (
            <button type="button" onClick={newTemplate}>New template</button>
          )}
        </div>
      </div>
      {status && <p className="admin-alert">{status}</p>}
      <div className={`admin-settings-template-hub${showEditor ? ' editor-open' : ''}`}>
        <aside className="admin-template-list">
          {templates.map((template) => (
            <button type="button" key={template.id} className={template.id === editingId ? 'is-active' : ''} onClick={() => editTemplate(template)}>
              <span>{template.name}</span>
              <small>{template.isDefault ? 'Default' : template.businessName}</small>
            </button>
          ))}
          {!templates.length && <p className="admin-empty">No document templates yet</p>}
        </aside>
        {showEditor && <form className="admin-template-form admin-template-form--hub" onSubmit={save}>
          <CollapsibleCard title="Template" defaultOpen>
            <div className="admin-template-form__grid">
              <label>Template name<input {...templateInputProps('name')} type="text" value={draft.name || ''} onChange={(event) => update('name', event.target.value)} /></label>
              <label>Logo URL<input {...templateInputProps('logoUrl')} type="text" value={draft.logoUrl || ''} onChange={(event) => update('logoUrl', event.target.value)} /></label>
            </div>
          </CollapsibleCard>

          <CollapsibleCard title="Business information">
            <div className="admin-template-form__grid">
              {TEMPLATE_FIELDS.filter(([key]) => !['name', 'logoUrl', 'bankName', 'accountHolder', 'accountNumber', 'branchCode', 'bicSwiftCode'].includes(key)).map(([key, label]) => (
                <label key={key}>{label}
                  <input {...templateInputProps(key)} type="text" value={draft[key] || ''} onChange={(event) => update(key, event.target.value)} />
                </label>
              ))}
            </div>
          </CollapsibleCard>

          <CollapsibleCard title="Bank details">
            <div className="admin-template-form__grid">
              {TEMPLATE_FIELDS.filter(([key]) => ['bankName', 'accountHolder', 'accountNumber', 'branchCode', 'bicSwiftCode'].includes(key)).map(([key, label]) => (
                <label key={key}>{label}
                  <input {...templateInputProps(key)} type="text" value={draft[key] || ''} onChange={(event) => update(key, event.target.value)} />
                </label>
              ))}
            </div>
          </CollapsibleCard>

          <CollapsibleCard title="Document colors">
            <div className="admin-template-color-grid admin-template-color-grid--hub">
              {TEMPLATE_COLOR_FIELDS.map(([key, label]) => (
                <label key={key}>{label}
                  <input {...templateInputProps(key)} type="color" value={draft[key] || '#000000'} onChange={(event) => update(key, event.target.value)} />
                </label>
              ))}
            </div>
          </CollapsibleCard>

          <CollapsibleCard title="PDF wording">
            <div className="admin-template-wording-groups">
              {TEMPLATE_WORDING_GROUPS.map((group) => (
                <fieldset key={group.title}>
                  <legend>{group.title}</legend>
                  <div className="admin-template-form__grid">
                    {group.fields.map(([key, label]) => (
                      <label key={key}>{label}
                        <input {...templateInputProps(key)} type="text" value={draft[key] || ''} onChange={(event) => update(key, event.target.value)} />
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            <label>Footer note<textarea {...templateInputProps('footerNote')} value={draft.footerNote || ''} onChange={(event) => update('footerNote', event.target.value)} /></label>
          </CollapsibleCard>

          <CollapsibleCard title="Terms">
            <label>Invoice terms<textarea {...templateInputProps('invoiceTerms')} value={draft.invoiceTerms || ''} onChange={(event) => update('invoiceTerms', event.target.value)} /></label>
            <label>Quotation terms<textarea {...templateInputProps('quotationTerms')} value={draft.quotationTerms || ''} onChange={(event) => update('quotationTerms', event.target.value)} /></label>
          </CollapsibleCard>

          <div className="admin-template-form__actions">
            <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save template'}</button>
            <button type="button" onClick={setDefault} disabled={draft.isDefault || saving}>Set default</button>
            <button type="button" className="admin-danger-btn" onClick={remove}>Delete</button>
            <p>{draft.isDefault ? 'This is the default template.' : 'Only one document template can be default.'}</p>
          </div>
        </form>}
        {showEditor && <aside className="admin-settings-preview">
          <div className="admin-doc-preview-label">Live preview</div>
          <TemplatePreview template={draft} activeField={activeTemplateField} />
        </aside>}
      </div>
    </section>
  );
}

function ensureSingleDefault(records) {
  if (!records.length) return [];
  const normalized = records.map((record) => normalizeDocumentTemplate(record.id, record));
  const defaultId = normalized.find((record) => record.isDefault)?.id || normalized[0].id;
  return normalized.map((record) => ({ ...record, isDefault: record.id === defaultId }));
}

export default function AdminSettingsFoundation() {
  const [tab, setTab] = useState('templates');

  return (
    <div className="admin-stack">
      <div className="admin-tabs">
        <button type="button" className={tab === 'templates' ? 'is-active' : ''} onClick={() => setTab('templates')}>Templates & Business</button>
        <button type="button" className={tab === 'services' ? 'is-active' : ''} onClick={() => setTab('services')}>Saved Services</button>
      </div>
      {tab === 'templates' ? <DocumentTemplatesSection /> : <SavedServicesSection />}
    </div>
  );
}
