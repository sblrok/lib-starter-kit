import React from 'react';
import pick from 'lodash/pick';
import { Form, FastField, withFormik } from 'formik';
import createFormWithI18 from '@lskjs/form/createFormWithI18';
import FormSubmit from '@lskjs/form/FormSubmit';
import T from '@lskjs/ui/T';
import Page from '~/lskjs/ui/Page';
import getAuthControls from './getAuthControls';

const SigninFormView = ({ control, status, errors }) => (
  <Form className="ant-form ant-form-vertical">
    <FastField {...control('email')} _required={false} />
    <FastField {...control('password')} _required={false} />
    <FormSubmit
      block
      status={status}
      errors={errors}
    >
      <T name="buttons.login" />
    </FormSubmit>
  </Form>
);

const SigninForm = createFormWithI18(({ i18 }) => ({
  withFormik,
  view: SigninFormView,
  controls: pick(getAuthControls({ i18 }), ['email', 'password']),
}));

export default ({ onSubmit }) => (
  <Page>
    <Page.Header />
    <SigninForm onSubmit={onSubmit} />
  </Page>
);
