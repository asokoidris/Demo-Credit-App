const server = require('./app/routes/index');
const keys = require('./app/config/keys');
const knex = require('./app/config/database');

const Port = keys.PORT || 4000;

//check database connection knex
knex
  .raw('SELECT 1')
  .then(() => {
    logger.info('Database connected');
  })
  .catch((err) => {
    logger.error(err);
  });

server.listen(Port, () => logger.info(`Server running on port ${Port}`));
