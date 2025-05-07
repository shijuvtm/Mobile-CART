const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}
module.exports.connect=function(done){
    const url = 'mongodb+srv://shijuavtm:shiju2001@cluster0.wtkfgfk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    const dbname="Mobile";
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
