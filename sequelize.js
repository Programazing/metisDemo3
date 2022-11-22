const Sequelize = require('sequelize')
const UserModel = require('./models/user')
const BlogModel = require('./models/blog')
const TagModel = require('./models/tag')
const SequelizeExpressInterceptor = require('@metis-data/sequelize-express-interceptor')

const interceptor = SequelizeExpressInterceptor.default.create({
  serviceName: "your-service-name", // The name of the service
  serviceVersion: "0.0.1", // The version of the service
  exporterApiKey: "09IXCB0grx9Uo0s28PfST7MXD5wUDOQl9vE8P1Di",
  exporterUrl: "https://ingest.metisdata.io/"
});


const sequelize = new Sequelize('codementor', 'root', 'root', {
  host: 'localhost',
  dialect: 'sqlite',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

const User = UserModel(sequelize, Sequelize)
// BlogTag will be our way of tracking relationship between Blog and Tag models
// each Blog can have multiple tags and each Tag can have multiple blogs
const BlogTag = sequelize.define('blog_tag', {})
const Blog = BlogModel(sequelize, Sequelize)
const Tag = TagModel(sequelize, Sequelize)

Blog.belongsToMany(Tag, { through: BlogTag, unique: false })
Tag.belongsToMany(Blog, { through: BlogTag, unique: false })
Blog.belongsTo(User);

// This instance won't be instrumented.
const sequelizeForPlan = this.sequelize;

interceptor.instrument(
  sequelizeForPlan, // The Sequelize instance for getting the plan
  {
    errorHandler: console.error, // Error handler, errors are still reporterd to metis' Sentry account
    shouldCollectPlans: true, // Get the plan for each intercepted query (default to true)
    excludedUrls: [/favicon.ico/], // URLs to exclude from tracing
    printToConsole: true, // Print outgoing spans in console (default to false, passed to exporter),

  },
);

// This instance will be instrumented.
//const sequelize = getSequelizeInstance()

sequelize.sync({ force: true })
  .then(() => {
    console.log(`Database & tables created!`)
  })

module.exports = {
  User,
  Blog,
  Tag
}
