const {connection, hashPassword} = require('./utils')

class MessageDao {
    static async getAllMessages() {
        try {
            const query = `SELECT m.id, m.content, m.created_at, m.user_id, u.username
			FROM messages m 
			JOIN users u ON u.id = m.user_id ORDER BY m.id DESC`
			
            const [messages] = await connection.query(query)
            return messages
        } catch (err) {
            throw new Error(`Failed to get all messages. Error: '${err.message}'.`)
        }
    }
    
    static async getMessageById(id) {
        try {
            const query = 'SELECT id, content, created_at FROM messages WHERE id = ?'
            const [result] = await connection.query(query, [id]);
            return result[0] ? result[0] : null
        } catch (err) {
            throw new Error(`Failed to get message with id ${id}. Error: '${err.message}'.`)
        }
    }

    static async createMessage(content, user_id) {
        try {
            const query = 'INSERT INTO messages (content, user_id) VALUES (?, ?)'
            const [result] = await connection.execute(query, [content, user_id])
            return result ? result.insertId : null
        } catch (err) {
            throw new Error(`Failed to create message with title '${title}'. Error: '${err.message}'.`)
        }
    }
    
    static async updateMessage(id, content) {
        try {
            const query = 'UPDATE messages SET content = ? WHERE id = ?'
            await connection.execute(query, [content, id])
        } catch (err) {
            throw new Error(`Failed to update message with id ${id}. Error: '${err.message}'.`)
        }
    }
    
    static async deleteMessageById(id) {
        try {
            const query = 'DELETE FROM messages WHERE id = ?'
            await connection.execute(query, [id])
        } catch (err) {
            throw new Error(`Failed to delete message with id ${id}. Error: '${err.message}'.`)
        }
    }
}

class UserDao {
    static async createUser(username, password) {
        try {
            const query = 'INSERT INTO users (username, password) VALUES (?, ?)'
            const [result] = await connection.execute(query, [username, hashPassword(password)])
            return result ? result.insertId : null
        } catch (err) {
            throw new Error(`Failed to create user with username '${username}'. Error: '${err.message}'.`)
        }
    }
	
	static async getUserByUsername(username) {
        try {
            const query = 'SELECT id, username, password FROM users WHERE username = ?'
            const [result] = await connection.query(query, [username]);
            return result[0] ? result[0] : null
        } catch (err) {
            throw new Error(`Failed to get user with username ${username}. Error: '${err.message}'.`)
        }
    }
	
	static async getUserById(username) {
        try {
            const query = 'SELECT id, username, password FROM users WHERE id = ?'
            const [result] = await connection.query(query, [username]);
            return result[0] ? result[0] : null
        } catch (err) {
            throw new Error(`Failed to get user with id ${id}. Error: '${err.message}'.`)
        }
    }
}

module.exports = {MessageDao, UserDao}