/* eslint-disable indent */
import Template from './_base';

export default class ChangeTimeGroupMeetingEmail extends Template {
  getSubject() {
    return this.t('emails.authCode.subject', this.props);
  }

  render() {
    // return this.props.code;
    // console.log('this.props', this.props);
    return `
      ${this.header()}
      ${this.content(`
        ${this.title(this.t('emails.authCode.title', this.props))}
        ${this.text(this.t('emails.authCode.text', this.props))}
        ${this.text(this.props.code)}
        ${this.buttonWithLink(this.t('emails.authCode.button', this.props), {
          href: this.props.link,
        })}
      `)}
      ${this.footer()}
    `;
  }
}


// /* eslint-disable indent */
// import Base from '@lskjs/mailer/templates/_mjml';
// import get from 'lodash/get';

// export default class AuthCodeTemplate extends Base {
//   getSubject() {
//     // return this.props.code;
//     return `${this.props.code} ${this.t('emails.authCode.subject', this.props)}`;
//   }

//   getText() {
//     return `
// ${this.t('emails.authCode.title', this.props)}
// ${this.t('emails.authCode.text', this.props)}
//     `;
//   }

//   render() {
//     // return this.props.code;
//     // console.log('this.props', this.props);
//     return `
//       ${this.header()}
//       ${this.content(`
//         ${this.title(this.t('emails.authCode.title', this.props))}
//         ${this.text(this.t('emails.authCode.text', this.props))}
//         ${this.text(this.props.code)}
//         ${this.buttonWithLink(this.t('emails.authCode.buttonFrom', this.props), {
//           href: this.props.link,
//         })}
//       `)}
//       ${this.footer()}
//     `;
//   }
// }
