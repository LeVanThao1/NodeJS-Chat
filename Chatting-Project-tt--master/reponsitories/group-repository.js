const BaseRepository = require('./base-repository');
const Group = require('../models/groups');
module.exports = class GroupRepository extends BaseRepository {
    constructor(){
        super('Group');
    }
    async create(data) {
        if (data.members.length > 2) {
            data.type = 'group';
        }
        const existedGroup = await this.getOne({ where : {
            members: {
                $all: data.members
            },
            type: 'individual'
        }});
        if (existedGroup) {
            return existedGroup;
        }
        const group = await Group.create(data);
        return group;
    }

}   