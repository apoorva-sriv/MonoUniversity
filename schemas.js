const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    user: {
        type: String,
        unique: true,
        minLength: 1
    },
    password: String,
    games: {
        type: [String],
        default:[]
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    money: {
        type: Number,
        default: 500
    },
    itemsOwned: {
        type: [mongoose.Types.ObjectId],
        default: []
    },
    itemSelected: {
        type: mongoose.Types.ObjectId,
        default: null
    },
    wins:{
        type: Number,
        default: 0
    },
    points:{
        type: Number,
        default: 0
    },
    image:{
        type: String,
        default: "img/tenkai.png"
    }
});

userSchema.pre('save', function(next) {
    const user = this;
    if (user.isModified('password')) {
        console.log(user.password);
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
});
userSchema.statics.authenticate = function(name, password) {
    const User = this;
    return User.findOne({ user: name }).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
};


const User = mongoose.model('User', userSchema);

const itemSchema = new Schema({
    name: String,
    description: String,
    image: String,
    price: Number,
	behaviourId: {
    	type:
	}
});

const Item = mongoose.model('Item', itemSchema);

const roomSchema = mongoose.Schema({
    users: [mongoose.Types.ObjectId],
    isPlaying: {
        type: Boolean,
        default: false
    }
});

const Room = mongoose.model('Room', roomSchema);

module.exports = {
    User: User,
    Item: Item,
    Room: Room
};

// Tile schema for tiles
const tileSchema = mongoose.Schema({
	name : {
		type: String,
		default: ""
	},
	
	fullname : {
		type: String,
		default: ""
	},	
	
	desc : {
		type: String,
		default: ""
	},
	
	image : {
		type: String,
		default: null
	},
	
	tileflags : {
		type: Number,
		default: 0
	},

	purchaseable : {
		type: Boolean,
		default: false
	},
	
	price : {
		type: Number,
		default: 0
	},
	
	owner : {
		type: Number,
		default: null
	},
	
	building : {
		type: Boolean,
		default: false
	}
});

const playerSchema = mongoose.Schema({
	user : {
		type: mongoose.Types.ObjectId,
		default: null
	},
	
	piece : { 
		type: Number,
		default: 0
	},
	
	color :	{
		type: String,
		default: ""
	},
	
	money : {
		type: Number,
		default: 1500
	},
	
	jailed : {
		type: Boolean,
		default: false
	},
	
	jailturns : {
		type: Number,
		default: 0
	},
	
	jailcards : {
		type: Number,
		default: 0
	},
	
	pastfirst : {
		type: Boolean,
		default: false
	},
	
	passedgo : {
		type: Boolean,
		default: false
	},
	
	gorestrict : {
		type: Boolean,
		default: false
	},
	
	oldposition : {
		type: Number,
		default: 0
	},
	
	position : {
		type: Number,
		default: 0
	},
	
	aiprofile : {
		type: Number,
		default: 0
	},
});

const boardSchema = mongoose.Schema({
		tiles: {	
			type: [tileSchema],
			default: []
		},
		
		players: {	
			type: [playerSchema],
			default: []
		},
		
		playerTurns: {
			type: [Number],
			default: []
		},
		
		playerTurn: {
			type: Number,
			default: 0
		},
		
		gameState: {
			type: Number,
			default: 0
		},
		
		dice : {
			type: [Number],
			default: [1, 1]
		},
		
		timeOutId : {
			type: Number,
			default: null
		},
		
		chanceCards : {
			type: [String],
			default: null
		},
		
		communityCards : {
			type: [String],
			default: null
		},
		
		chanceCount : {
			type: Number,
			default: -1
		},
		
		communityCount : {
			type: Number,
			default: -1
		},
		
		gametype : {
			type: Number,
			default: null
		},
		
		diceRolling : {
			type: Boolean,
			default: false
		},
});

module.exports.Board = mongoose.model('Board', boardSchema);
