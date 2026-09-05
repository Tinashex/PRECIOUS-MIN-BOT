import { Sequelize } from 'sequelize';

class DatabaseManager {
    static instance = null;

    static getInstance() {
        if (!DatabaseManager.instance) {
            const DATABASE_URL = process.env.DATABASE_URL || './database.db';

            if (DATABASE_URL === './database.db') {
                DatabaseManager.instance = new Sequelize({
                    dialect: 'sqlite',
                    storage: DATABASE_URL,
                    logging: false,
                });
            } else {
                DatabaseManager.instance = new Sequelize(DATABASE_URL, {
                    dialect: 'postgres',
                    protocol: 'postgres',
                    ssl: true,
                    dialectOptions: {
                        native: true,
                        ssl: {
                            require: true,
                            rejectUnauthorized: false,
                        },
                    },
                    logging: false,
                });
            }
        }

        return DatabaseManager.instance;
    }
}

const DATABASE = DatabaseManager.getInstance();

DATABASE.sync()
    .then(() => {
        console.log('Precious Md Database synchronized successfully.');
    })
    .catch((error) => {
        console.error('Error synchronizing the database:', error);
    });

export { DATABASE };
export default DATABASE;