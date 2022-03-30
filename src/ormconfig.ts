
const config = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'junior',
    password: '123',
    database: 'course',
    entities: [__dirname+"/**/*.entity{.ts,.js}"],
    synchronize: true, // Нельзя использовать в продакшене
}

export default config