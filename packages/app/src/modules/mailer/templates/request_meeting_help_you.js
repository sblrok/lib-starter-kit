import Template from './template';
import moment from 'moment';
import _ from 'lodash';
export default class ChangeTimeGroupMeetingEmail extends Template {
  getOptions() {
    return {
      subject: 'Тебя пригласили на встречу!',
    };
  }
  render({ ctx, params = {} }) {
    const data = {
      profile: {
        name: '',
        avatar: '',
        language: '',
      },
      request: {
        startDate: '',
        place: {
          name: '',
          address: null,
        },
      },
    };
    if (params && params.profile) {
      data.profile.name = params.profile.name;
      data.profile.avatar = _.get(params, 'profile.avatars.original');
      data.profile.language = params.profile.nativeLanguage;
    }
    if (params && params.request) {
      if (params.request.startDate) {
        data.request.startDate = data.date = moment(params.request.startDate)
        .locale('ru')
        .format('LL [в] LT')
        .replace('г. ', '');
      }
      if (params.request.place && params.request.place.name) {
        data.request.place.name = params.request.place.name;
      }
      if (params.request.place && params.request.place.address) {
        data.request.place.address = `(${params.request.place.address})`;
      }
    }
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title></title>
  	<link href="http://hi-jay.eu/mails/mail.css" rel="stylesheet" type="text/css" media="all">
  </head>
  <body>
  <div style="background:#dfe8ef;display: table;width: 100%;margin: 0px auto;">
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
  				<h1>Тебя пригласили на встречу!<br>Джей ждет твоего ответа.</h1>
  				<div class="jays">
  					<div class="jay">
  						<div class="avatar">
  							<div class="position">
  								<div class="position_jay"><img src="${data.profile.avatar}" class="jay"></div>
  							</div>

  							<div class="position">
  								<div class="position_mask_logo"><img src="http://hi-jay.eu/mails/mask_logo.png" class="mask_logo"></div>
  							</div>
  							<div class="position">
  								<div class="position_flag"><img src="${ctx.helpers.getFlagUrl(data.profile.language)}" class="flag"></div>
  							</div>
  						</div>
  						<div class="meeting_i">
  								<div><b>${data.profile.name}</b> предлагает помощь в изучении языка.</div>
  								<div class="place">${data.request.place.name} ${data.request.place.address ? data.request.place.address : ''}</div>
  								<div class="time">${data.request.startDate}</div>
  						</div>
  						<div class="clear"></div>
  					</div>
  					<div>
  						<h2>Что сделать, чтобы ответить на запрос?</h2>
  						<ol>
  							<li>Открой приложение «Hi, Jay!»
  							<li>Перейди в раздел “Мои встречи”, далее в подраздел “Запросы”
  							<li>Перейди в профиль нужного джея
  						</ol>
  					</div>
  				</div>
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
  					<p>Напиши на <a href="mailto:support@hi-jay.eu">support@hi-jay.eu</a>, если у тебя возникли проблемы с использованием «Hi, Jay!», мы обязательно тебе поможем.
  					<p>С уважением, команда «Hi, Jay!».
  					<p><a href="http://www.hi-jay.eu" target="_blank">www.hi-jay.eu</a>
  					<p class="unsibscribe">Нажмите <a href="${ctx.helpers.getLinkToDisableOption('newRequestsPush', params._profile.token)}">здесь</a>, чтобы отказаться от этой рассылки.
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
  </html>`;
  }
}
