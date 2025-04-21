const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}
module.exports.connect=function(done){
    const url='mongodb://localhost:27017';
    const dbname="Shopping1";
    mongoClient.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(client=>{
        state.db=client.db(dbname);
        console.log("database connected successfully");
        if(typeof done==='function')
        done();

        
    }).catch(err=>{
        if(typeof done==='function') done(err);

    });
    };
    


module.exports.get = function () {
    return state.db
};