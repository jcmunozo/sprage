// Card categories shown on the language page (and in the breadcrumb)
export const CATEGORIES = [
  { id: 'vocabulary', label: 'Vocabulary', icon: '词', description: 'Words & definitions', color: '#4FD18E' },
  { id: 'idiom',      label: 'Idioms',     icon: '语', description: 'Phrases & expressions', color: '#E89968' },
  { id: 'grammar',    label: 'Grammar',    icon: '文', description: 'Rules & structures', color: '#6EB6E8' },
];

export const categoryById = (id) => CATEGORIES.find((c) => c.id === id);
