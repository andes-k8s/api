import { RoboModel } from './../../../utils/roboSender/roboSchema';
import { MongoQuery, ResourceBase, ResourceNotFound } from '@andes/core';

class SendMessageCacheResource extends ResourceBase {
    Model = RoboModel;
    resourceName = 'sendMessageCache';
    keyId = '_id';
    searchFileds = {
        email: MongoQuery.partialString,
        phone: MongoQuery.partialString,
        search: (value) => {
            return {
                $or: [
                    { email: MongoQuery.partialString(value) },
                    { phone: MongoQuery.partialString(value) }
                ]
            };
        }
    };
}

export const SendMessageCacheCtr = new SendMessageCacheResource({});
module.exports = SendMessageCacheCtr.makeRoutes();
