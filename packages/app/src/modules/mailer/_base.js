/* eslint-disable indent */
import Base from '@lskjs/mailer/templates/_html';

export default class Base2 extends Base {
  renderHead() {
    return `
<head>
  <meta charset="UTF-8">
  <title>${this.getSubject()}</title>
  <link href="http://hi-jay.eu/mails/mail.css" rel="stylesheet" type="text/css" media="all">
</head>
    `;
  }

  content(content) {
    return `
<div class="content">
    ${content}
</div>
`;
  }
  header() {
    return `
<!DOCTYPE html>
<html lang="en">
  ${this.renderHead()}
  <div style="background:#dfe8ef;display: table;width: 100%;margin: 0px auto;">
  <body>
    <div class="mail">
      <div class="lines">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div class="body_mail">
        <div class="header">${this.t('emails.base.hello', this.props)}</div>
        `;
  }
  unsubscribe() {
    return '';// `<p class="unsibscribe">Нажмите <a href="${ctx.helpers.getLinkToDisableOption('newRequestsPush', params._profile.token)}">здесь</a>, чтобы отказаться от этой рассылки.`
  }
  footer() {
    return `
          <ul class="downloads">
            <li class="appstore"><a href="https://vk.com/away.php?to=https%3A%2F%2Fitunes.apple.com%2Fru%2Fapp%2Fhi-jay%21-nositeli-azyka-radom%21%2Fid1071097131%3Fmt%3D8&post=-98739706_203" target="_blank"></a>
            <li class="playstore"><a href="https://vk.com/away.php?to=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.hijay.hijay&post=-98739706_203" target="_blank"></a>
          </ul>
          <div class="footer1">
            <div class="social_footer">
              <div class="fb"><a href="https://www.facebook.com/hijayapp/" target="_blank"></a></div>
            </div>
            <div class="social_footer">
              <div class="vk"><a href="https://vk.com/hijayapp" target="_blank"></a></div>
            </div>
            <p>
              ${this.t('emails.base.writeto', this.props)} <a href="mailto:support@hi-jay.eu">support@hi-jay.eu</a>, 
              ${this.t('emails.base.problems', this.props)} 
            </p>
            <p>
              ${this.t('emails.base.regards', this.props)}
            </p>
            <p> 
              <a href="http://www.hi-jay.eu" target="_blank">www.hi-jay.eu</a>
            </p>
            ${this.unsubscribe()}
          </div>
        </div>
      </div>
      <div class="lines">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </div>
</body>
</div>
</html>`;
  }


  title(content) {
    return `<h1>${content}</h1>`;
  }

  text(content) {
    return `<p>${content}</p>`;
  }
  buttonWithLink(content, { href } = {}) {
    return `<p><a href="${href}" target="_blank">${content}</a>`;
  }
}
