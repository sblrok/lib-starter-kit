// import getLanguagesService from '../../services/LanguagesService';

const getLanguagesService = () => ({ t: a => a });

export default (ctx) => {
  const LanguagesService = getLanguagesService(ctx);
  // const defLocale = 'en'
  const notice = {};
  notice.noticeTypes = {
    // Когда приходит запрос HELP_ME
    async msg1({ fromProfile, toProfile }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `${fromProfile.name} просит помочь в изучении ${LanguagesService.t(`${toProfile.nativeLanguage}`)}.`;
          break;
        default:
          text = `${fromProfile.name} asks you for help with language learning`;
          break;
      }
      return text;
    },
    // Когда приходит положительный ответ за запрос "Help me"
    async msg2({ toProfile }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `${toProfile.name} предложил(а) вам место и время встречи.`;
          break;
        default:
          text = `${toProfile.name} suggested you the place and the time of the meeting.`;
          break;
      }
      return text;
    },
    // Когда приходит отказ на запрос "HELP_ME"
    async msg3({ profile }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `К сожалению, ${profile.name} отклонил(а) запрос на встречу`;
          break;
        default:
          text = `Sorry, but ${profile.name} cannot help you with learning languages right now.
          Try you request later.`;
          break;
      }
      return text;
    },
    // Когда приходит запрос на встречу "I Help you"
    async msg4({ request, fromProfile, toProfile }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `${fromProfile.name} хочет помочь вам в изучении ${LanguagesService.t(`${fromProfile.nativeLanguage}`)}.`;
          break;
        default:
          text = `${fromProfile.name} wants to help you with learning languages.`;
          break;
      }
      return text;
    },
    // Когда приходит положительный ответ за запрос "I help you"
    async msg5({ request, fromProfile, toProfile }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `${toProfile.name} подтвердил(а) вашу встречу.`;
          break;
        default:
          text = `${toProfile.name} confirmed the meeting.`;
          break;
      }
      return text;
    },
    // Когда приходит отказ за запрос "I Help you"
    async msg6({ profile }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `К сожалению, ${profile.name} отклонил(а) запрос на встречу.`;
          break;
        default:
          text = `Sorry, but ${profile.name} cannot meet with you at the suggested time or place.
          Try to suggest help later.`;
          break;
      }
      return text;
    },
    // Когда создается групповая встреча с изучаемым языком в радиусе 50км.
    async msg7({ event, creator = {} }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `${creator.firstName || 'Кто-то'} создал групповую встречу на ${LanguagesService.t(`pre_${event.language}`)}. Присоединяйся!`;
          break;
        default:
          text = 'Soon they will practice the language you are studying nearby you';
          break;
      }
      return text;
    },
    //  Когда Джей, присоединился к вашей групповой встрече
    async msg8({ event, profile }, locale) {
      let text;
      const localDate = await event.getLocalTime();
      const localTime = localDate.format('hh:mm');
      switch (locale) {
        case 'ru':
          text = `${profile.firstName} присоединился к вашей групповой встрече "${event.title}"`;
          break;
        default:
          text = `${profile.firstName} will also join the meeting on the ${localTime} in ${event.place.name}`;
          break;
      }
      return text;
    },
    async msg9({ fromProfile, message }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `${fromProfile.name}: ${message.text}`;
          break;
        default:
          text = `${fromProfile.name} send you a message: ${message.text}`;
          break;
      }
      return text;
    },
    async msg10({ fromProfile, message }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `${fromProfile.name} написал: ${message.text}`;
          break;
        default:
          text = `${fromProfile.name} send you a message: ${message.text}`;
          break;
      }
      return text;
    },
    //  Когда отменилась подтвержденная личная встреча
    async msg11({ request, profile }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `К сожалению, ${profile.name} отменил встречу =(`;
          break;
        default:
          text = `We are sorry, but ${profile.name} declined the meeting.`;
          break;
      }
      return text;
    },
    //  Когда изменилось место личной встречи
    async msg12({ request, profile }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `${profile.name} предлагает изменить место встречи.`;
          break;
        default:
          text = `${profile.name} suggests you another places and time for the meeting.`;
          break;
      }
      return text;
    },
    // Когда отменилась групповая встреча
    async msg13({ event }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `К сожалению, встреча "${event.title}" отменена.`;
          break;
        default:
          text = `We are sorry, but the group meeting "${event.title}" was cancelled`;
          break;
      }
      return text;
    },
    // Когда изменилось место групповой встречи
    async msg14({ event }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `Групповая встреча "${event.title}" пройдет в другом месте!`;
          break;
        default:
          text = `The creator of the meeting "${event.title}" changed the place of the meeting.`;
          break;
      }
      return text;
    },
    // Когда изменилось время групповой встречи
    async msg15({ event }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `Групповая встреча"${event.title}" пройдет в другое время!`;
          break;
        default:
          text = `The creator of the meeting "${event.title}" changed the time of the meeting.`;
          break;
      }
      return text;
    },
    async msg16({ profile }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = 'Недалеко от тебя есть носитель одного из изучаемых языков. Назначь ему встречу!';
          break;
        default:
          text = 'There is a native speaker of the language you are studying nearby. Suggest him to meet!';
          break;
      }
      return text;
    },
    async msg17({ profile }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `К "Hi, Jay" присоединился ${profile.name}. Назначь ему встречу и поговори с ним на ${LanguagesService.t(`pre_${profile.nativeLanguage}`)}!`;
          break;
        default:
          text = `${profile.name} has just joined "Hi jay". Suggest him to meet for a cup of coffee and talk to him on the language of the native speaker.`;
          break;
      }
      return text;
    },
    async msg18({ text }, locale) {
      return text;
    },
    async msg19({ event }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `Скоро рядом с тобой пройдет групповая встреча на ${LanguagesService.t(`pre_${event.language}`)}.`;
          break;
        default:
          text = `Soon there will be a group meeting of ${event.language}`;
          break;
      }
      // console.log(text)
      return text;
    },
    //  Когда Джей, который находится у тебя в My Jays и присоединяется к групповой встрече
    async msg20({ event, profile }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `${profile.name} пойдет на групповую встречу "${event.title}". Присоединяйся!`;
          break;
        default:
          text = `${profile.name} will visit the group meeting "${event.title}". Join the meeting too!`;
          break;
      }
      return text;
    },
    async msg21({ request, profile }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `${profile.name} предлагает изменить время встречи.`;
          break;
        default:
          text = `${profile.name} suggests you another places and time for the meeting.`;
          break;
      }
      return text;
    },
    async msg22({ request, profile }, locale) {
      let text;
      switch (locale) {
        case 'ru':
          text = `${profile.name} предлагает изменить место и время встречи.`;
          break;
        default:
          text = `${profile.name} suggests you another places and time for the meeting.`;
          break;
      }
      return text;
    },
  };
  notice.get = async function (msg) {
    const message = await this.noticeTypes[msg];
    return message || null;
  };

  return notice;
};
