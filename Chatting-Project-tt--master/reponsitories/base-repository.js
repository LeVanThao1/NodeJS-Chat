const {mongoose} = require('../models')
module.exports = class BaseRepository {
    constructor(modelName) {
        this.model = mongoose.model(modelName);
    }
    getAll(options) {
        const newOptions = Object.assign(
            {
                isLean : true,
                limit: 100,
                page:1,
                field: '',
                populate: [],
                sort: ''
            },
            options
        )
        if (newOptions.limit > 100) {
            newOptions.limit = 100;
        }
        newOptions.where = Object.assign(
            {
                deleteAt: null
            },
            newOptions.where
        ); 
        const skip = (newOptions.page - 1) * newOptions.limit;
        return this.model.find(newOptions.where)
            .skip(skip)
            .limit(newOptions.limit)
            .select(newOptions.field)
            .sort(newOptions.sort)
            .populate(newOptions.populate)
            .lean(newOptions.isLean);
    }
    getOne(options) {
        const newOptions = Object.assign(
            {
                isLean: true,
                field: '',
                populate: [],
            },
            options);
        newOptions.where = Object.assign(
            {
                deleteAt: null
            },
            newOptions.where
        );
    
        return this.model.findOne(newOptions.where)
        .select(newOptions.field)
        .populate(newOptions.populate)
        .lean(newOptions.isLean);
    }
    create(data) {
        if (Array.isArray(data)) {
            return this.model.createMany(data);
        }
        return this.model.create(data);
    }
    updateOne(options) {
        const newOptions = {...options};
        newOptions.where = Object.assign(
            {
                deleteAt: null
            },
            newOptions.where
        );  
        newOptions.data = {...newOptions.data}
        return this.model.updateOne(newOptions.where, newOptions.data);
    }
    deleteOne(options) {
        const newOptions = {...options};
        newOptions.where = Object.assign(
            {
                deleteAt: null
            },
            newOptions.where
        );  
        newOptions.data = {...newOptions.data}
        return this.model.updateOne(newOptions.where, { $set: { deleteAt: new Date() }});
    }
    updateMany(options) {
        const newOptions = {...options};
        newOptions.where = Object.assign(
            {
                deleteAt: null
            },
            newOptions.where
        );  
        newOptions.data = {...newOptions.data}
        return this.model.updateMany(newOptions.where, newOptions.data);
    }
    count(options) {
        const newOptions = {...options};
        newOptions.where = Object.assign(
            {
                deleteAt: null
            },
            newOptions.where
        );
        return this.model.count(newOptions.where);
    }
}