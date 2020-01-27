import Input from '@lskjs/form/controls/Input';

const getAuthControls = ({ i18 = { t: a => a } }) => ({
  email: {
    component: Input,
    title: i18.t('authForm.email'),
    required: true,
    type: 'email',
  },
  password: {
    component: Input,
    title: i18.t('authForm.password'),
    required: true,
    type: 'password',
  },
  name: {
    component: Input,
    title: i18.t('authForm.name'),
    required: true,
  },
});

export default getAuthControls;
