export default () => ([
  {
    name: 'filter',
    in: 'formData',
    required: false,
    type: 'string',
    description: '[object] Фильтр, например { "some": "thing" }',
  },
  {
    name: 'sort',
    in: 'formData',
    required: false,
    type: 'string',
    description: '[object] Сортировка, например { "createdAt": -1 }',
  },
  {
    name: 'limit',
    in: 'formData',
    required: false,
    type: 'number',
    description: 'Лимит сущностей на странице, дефолтно 10, максимально 100',
  },
  {
    name: 'skip',
    in: 'formData',
    required: false,
    type: 'number',
    description: 'Пропустить это количество сущностей, дефолтно 0',
  },
  {
    name: 'select',
    in: 'formData',
    required: false,
    type: 'array',
    description: 'Какие поля из сущности выбираем, например ["firstName", "lastName"]',
  },
  {
    name: 'view',
    in: 'formData',
    required: false,
    type: 'string',
    description: 'Псевдонимы для групп selectов, например tiny == ["name", "avatar", "online"]',
  },
]);
