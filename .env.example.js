module.exports = {
  url: 'http://localhost:3000',
  db: {
    uri: '%MONGO_DB_URI%',
    debug: true,
  },
  jwt: {
    secret: '%JWT_SECRET%'
  },
  log: {
    level: 'trace',
  },
  client: {
    log: {
      level: 'trace',
    },
    site: {
      abbr: 'LSK',
      title: 'LegoStarterKit LOCAL',
      assets: '/assets/lsk',
      description: 'Node.js & React isomorphic app creator',
      copyright: '<span>Copyright &copy; 2016-2019 </span><a href="http://github.com/isuvorov/lego-starter-kit">Lego-starter-kit</a>.</strong> All rights reserved.',
    },
  },
  mailer: {
    admin: {
      to: '%ADMIN_EMAIL%',
      locale: 'en',
    },
    transport: {
      host: 'smtp.yandex.ru',
      port: 465,
      secure: true,
      auth: {
        user: '%EMAIL_USER%',
        pass: '%EMAIL_PASS%',
      },
    },
    options: {
      from: '"LegoStarterKit" <%EMAIL_USER%>',
      subject: 'LegoStarterKit',
    },
  },
};