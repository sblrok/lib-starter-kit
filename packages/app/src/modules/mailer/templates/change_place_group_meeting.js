import Template from './template';
import moment from 'moment';
export default class ChangePlaceGroupMeetingEmail extends Template {
  getOptions() {
    return {
      subject: 'Изменено место встречи!',
    };
  }
  render({ ctx, params = {} }) {
    const data = {
      event: {
        title: '',
        image: '',
        place: '',
        date: '',
        language: 'en',
      },
    };
    if (params.event) {
      data.event.title = params.event.title;
      data.event.date = moment(params.event.startDate)
      // .locale(params._profile.nativeLanguage || 'en')
      .locale('ru' || 'en')
      .format('LL [в] LT')
      .replace('г. ', '');
      if (params.event.place) {
        if (params.event.place.name) {
          data.event.place = params.event.place.name;
        }
        if (params.event.place.address) {
          data.event.place += ` (${params.event.place.address})`;
        }
      }
      data.event.address = params.event.place.address;
      data.event.image = params.event.coverImage;
      data.event.language = params.event.language;
    }
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title></title>
  	<link href="http://hi-jay.eu/mails/mail.css" rel="stylesheet" type="text/css" media="all">
  </head>
  <body>
  	<div style="background:#dfe8ef;display: table; width: 100%; margin: 0px auto;">
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
  				<h1>Место групповой встречи "${data.event.title}" изменено.</h1>
  				<div class="jays">
  					<div class="jay">
  						<div class="avatar">
  							<div class="position">
  								<div class="position_jay"><img src="${data.event.image}" class="jay"></div>
  							</div>

  							<div class="position">
  								<div class="position_mask_logo"><img src="http://hi-jay.eu/mails/mask_logo.png" class="mask_logo"></div>
  							</div>

  							<div class="position">
  								<div class="position_flag"><img src="${ctx.helpers.getFlagUrl(data.event.language)}" class="flag"></div>
  							</div>
  						</div>
  						<div class="meeting i">
  								<div><b>${data.event.title}</b></div>
  								<div class="place">${data.event.place}<font style="color:#dd0000">(обновлено)</style></div>
  								<div class="time">${data.event.date}</div>
  						</div>
  						<div class="clear"></div>
  					</div>
  					<p>Не забудьте обновить напоминание о встрече в календаре вашего смартфона.</p>
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
  					<p class="unsibscribe">Нажмите <a href="${ctx.helpers.getLinkToDisableOption('AddEditEventsEmail', params._profile.token)}">здесь</a>, чтобы отказаться от этой рассылки.
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
