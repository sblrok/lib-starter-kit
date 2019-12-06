import Template from './template';
import moment from 'moment';
export default class ChangeTimeGroupMeetingEmail extends Template {
  getOptions() {
    return {
      subject: 'Добро пожаловать!',
    };
  }
  render({ params = {} }) {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title></title>
  	<link href="http://hi-jay.eu/mails/mail.css" rel="stylesheet" type="text/css" media="all">
  </head>
  <body>
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
  			<div class="header">Привет, Джей!</div>
  			<div class="content">
  				<h1>Добро пожаловать в мировое<br>сообщество носителей языка «Hi, Jay!»</h1>
  				<p>Благодарим тебя за то, что присоединился к нашему интернациональному сообществу.  «Hi, Jay!» поможет тебе найти носителей языка по всему миру для того, чтобы ты мог практиковать иностранные языки в любом месте, в любое время.
  				<p><b>Твои данные для e-mail авторизации:</b>
  				<br>Логин: ${params.login}
  				<br>Пароль: ${params.password}
  				<div class="social" style="margin: 20px 0px 0px 0px;">
  					<div>Поддержите наше приложение,<br>рассказав о нем друзьям.</div>
  					<ul>
  						<li class="fb" style="margin-top:0px; margin-left:0px; margin-right:0px;"><a href="https://www.facebook.com/hijayapp/" target="_blank"></a>
  						<li class="vk" style="margin-top:0px; margin-left:20px; margin-right:0px;"><a href="https://vk.com/hijayapp" target="_blank"></a>
  					</ul>
  				</div>
  				<div class="footer1">
  					<p>Если тебе нравится «Hi, Jay!», пожалуйста, удели немного времени и оставь хороший отзыв о нашем приложении в App Store или Google Play Store, это очень нам поможет!

  					<p>С уважением, команда «Hi, Jay!».
  					<p><a href="http://www.hi-jay.eu" target="_blank">www.hi-jay.eu</a>
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
  </html>`
  }
}
