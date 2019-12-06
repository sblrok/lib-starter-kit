import React from 'react';
import omit from 'lodash/omit';
import { Form, FastField, withFormik } from 'formik';
import createFormWithI18 from '@lskjs/form/createFormWithI18';
import FormSubmit from '@lskjs/form/FormSubmit';
import Page from '@lskjs/ui/Page';

import T from '@lskjs/ui/T';
import getAuthControls from './getAuthControls';

const SignupFormView = ({ control, status, errors }) => (
  <Form className="ant-form ant-form-vertical">
    <FastField {...control('email')} />
    <FastField {...control('password')} />
    <FormSubmit
      block
      status={status}
      errors={errors}
    >
      <T name="authPage.signupButton" />
    </FormSubmit>
  </Form>
);

const SignupForm = createFormWithI18(({ i18 }) => ({
  withFormik,
  view: SignupFormView,
  controls: getAuthControls({ i18 }),
}));

export default ({ onSubmit }) => (
  <Page>
    <Page.Header />
    <SignupForm onSubmit={onSubmit} />
  </Page>
);
