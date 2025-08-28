// Testcontainers global setup for Jest integration/e2e
const { GenericContainer, StartedTestContainer, Wait } = require('testcontainers');

/** @type {StartedTestContainer | null} */
let pgContainer = null;
/** @type {StartedTestContainer | null} */
let redisContainer = null;

module.exports = async () => {
    // Start Postgres container
    pgContainer = await new GenericContainer('postgres:15')
        .withEnv('POSTGRES_DB', 'test_db')
        .withEnv('POSTGRES_USER', 'test_user')
        .withEnv('POSTGRES_PASSWORD', 'test_password')
        .withExposedPorts(5432)
        .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
        .start();

    // Optionally start Redis
    redisContainer = await new GenericContainer('redis:7')
        .withExposedPorts(6379)
        .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
        .start();

    const pgHost = pgContainer.getHost();
    const pgPort = pgContainer.getMappedPort(5432);
    const redisHost = redisContainer.getHost();
    const redisPort = redisContainer.getMappedPort(6379);

    // Inject envs for the Nest app under test
    process.env.DATABASE_HOST = pgHost;
    process.env.DATABASE_PORT = String(pgPort);
    process.env.DATABASE_NAME = 'test_db';
    process.env.DATABASE_USER = 'test_user';
    process.env.DATABASE_PASSWORD = 'test_password';
    process.env.DATABASE_SSL = 'false';

    process.env.REDIS_HOST = redisHost;
    process.env.REDIS_PORT = String(redisPort);

    // store container info on global for teardown
    global.__PG_CONTAINER__ = pgContainer;
    global.__REDIS_CONTAINER__ = redisContainer;
};


