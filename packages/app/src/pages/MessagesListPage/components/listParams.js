// import HeaderItem from './ChannelsListHeaderItem';
import Item from './MessagesListItem';
// import Tags from './Tags';
// import FilterForm from './FilterForm';

const columns = {
  1200: ['20px', 'minmax(150px, 1.76fr)',   '48px',   '0.66fr', '0.66fr', '130px', '112px', '1fr'], // eslint-disable-line
  992:  ['20px', 'minmax(150px, 1.76fr)',    '48px',   '0.66fr', null, null, null], // eslint-disable-line
  768:  ['20px', 'minmax(150px, 1.76fr)',    '48px',   null,  null, null, null], // eslint-disable-line
  570:  ['20px', 'minmax(150px, 1.76fr)',   null,    null,  null, null, null], // eslint-disable-line
  0:    ['20px', 'minmax(100px, 1.76fr)', null,       null,    null,  null, null, null], // eslint-disable-line
};

export default {
  // HeaderItem,
  columns,
  Item,
  // Tags,
  // FilterForm,
  // show: { download: false, more: false, searchResults: false },
};
