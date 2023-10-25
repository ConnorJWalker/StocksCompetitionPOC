'use strict';

const { DataTypes } = require('sequelize')

const userInclude = {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
        model: {
            tableName: 'Users'
        },
        key: 'id'
    }
}

const instrumentInclude = {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
        model: {
            tableName: 'Instruments',
        },
        key: 'id'
    }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface) {
        const results = await Promise.all([
            queryInterface.createTable('Users', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: DataTypes.INTEGER
                },
                displayName: {
                    allowNull: false,
                    type: DataTypes.STRING(32)
                },
                discordUsername: {
                    allowNull: false,
                    unique: true,
                    type: DataTypes.STRING(32)
                },
                profilePicture: {
                    allowNull: false,
                    type: DataTypes.STRING
                },
                displayColour: {
                    allowNull: false,
                    type: DataTypes.STRING(7)
                },
                password: {
                    allowNull: false,
                    type: DataTypes.STRING
                },
                isAdmin: {
                    allowNull: false,
                    defaultValue: false,
                    type: DataTypes.BOOLEAN
                },
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE
            }),
            queryInterface.createTable('Instruments', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: DataTypes.INTEGER
                },
                type: {
                    allowNull: false,
                    type: DataTypes.STRING(7)
                },
                currencyCode: {
                    allowNull: false,
                    type: DataTypes.STRING(3)
                },
                name: {
                    allowNull: false,
                    type: DataTypes.STRING
                },
                ticker: {
                    allowNull: false,
                    type: DataTypes.STRING
                },
                t212Ticker: {
                    allowNull: false,
                    unique: true,
                    type: DataTypes.STRING
                },
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE
            })
        ])

        const dependants = await Promise.all([
            queryInterface.createTable('AccountValues', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: DataTypes.INTEGER
                },
                UserId: userInclude,
                cash: {
                    allowNull: false,
                    type: DataTypes.DECIMAL(10, 2)
                },
                invested: {
                    allowNull: false,
                    type: DataTypes.DECIMAL(10, 2)
                },
                gainLoss: {
                    allowNull: false,
                    type: DataTypes.DECIMAL(10, 2)
                },
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE
            }),
            queryInterface.createTable('ApiKeys', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: DataTypes.INTEGER
                },
                UserId: userInclude,
                isValid: {
                    allowNull: false,
                    type: DataTypes.BOOLEAN,
                    defaultValue: true
                },
                apiKey: {
                    allowNull: false,
                    type: DataTypes.STRING
                },
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE
            }),
            queryInterface.createTable('Comments', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: DataTypes.INTEGER
                },
                PostId: {
                    allowNull: false,
                    foreignKey: true,
                    type: DataTypes.INTEGER
                },
                UserId: userInclude,
                postType: {
                    allowNull: false,
                    type: DataTypes.STRING(16)
                },
                body: {
                    allowNull: false,
                    type: DataTypes.TEXT
                },
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE
            }),
            queryInterface.createTable('Disqualifications', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: DataTypes.INTEGER
                },
                UserId: userInclude,
                strikes: {
                    allowNull: false,
                    type: DataTypes.INTEGER,
                    defaultValue: 0
                },
                disqualified: {
                    allowNull: false,
                    type: DataTypes.BOOLEAN,
                    defaultValue: false
                },
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE
            }),
            queryInterface.createTable('Followers', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: DataTypes.INTEGER
                },
                followerId: userInclude,
                followingId: userInclude,
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE
            }),
            queryInterface.createTable('OpenPositions', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: DataTypes.INTEGER
                },
                UserId: userInclude,
                InstrumentId: instrumentInclude,
                quantity: {
                    allowNull: false,
                    type: DataTypes.DECIMAL(15, 5)
                },
                averagePrice: {
                    allowNull: false,
                    type: DataTypes.DECIMAL(10, 2)
                },
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE
            }),
            queryInterface.createTable('OrderHistories', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: DataTypes.INTEGER
                },
                UserId: userInclude,
                InstrumentId: instrumentInclude,
                type: {
                    allowNull: false,
                    type: DataTypes.STRING(4)
                },
                averagePrice: {
                    allowNull: false,
                    type: DataTypes.DECIMAL(10, 2)
                },
                quantity: {
                    allowNull: false,
                    type: DataTypes.DECIMAL(15, 5)
                },
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE
            }),
            queryInterface.createTable('Reactions', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: DataTypes.INTEGER
                },
                UserId: userInclude,
                PostId: {
                    allowNull: false,
                    type: DataTypes.INTEGER
                },
                postType: {
                    allowNull: false,
                    type: DataTypes.STRING(16)
                },
                type: {
                    allowNull: false,
                    type: DataTypes.INTEGER
                },
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE
            }),
            queryInterface.createTable('RefreshTokens', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: DataTypes.INTEGER
                },
                UserId: userInclude,
                family: {
                    allowNull: false,
                    type: DataTypes.UUID
                },
                token: {
                    allowNull: false,
                    type: DataTypes.STRING(1024)
                },
                used: {
                    allowNull: false,
                    defaultValue: false,
                    type: DataTypes.BOOLEAN
                },
                invalid: {
                    allowNull: false,
                    defaultValue: false,
                    type: DataTypes.BOOLEAN
                },
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE
            }),
        ])

        return [...results, ...dependants]
    },

    async down (queryInterface) {
        return Promise.all([
            queryInterface.dropTable('AccountValues'),
            queryInterface.dropTable('ApiKeys'),
            queryInterface.dropTable('Comments'),
            queryInterface.dropTable('Disqualifications'),
            queryInterface.dropTable('Followers'),
            queryInterface.dropTable('Instruments'),
            queryInterface.dropTable('OpenPositions'),
            queryInterface.dropTable('OrderHistories'),
            queryInterface.dropTable('Reactions'),
            queryInterface.dropTable('RefreshTokens'),
            queryInterface.dropTable('Users')
        ])
    }
};
