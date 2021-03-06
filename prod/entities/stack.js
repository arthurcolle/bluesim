
function StackModel(a) {
    this.view = a;
    this.nservers = 1;
	this.distribution = "constant";
	this.params = [null, null];
    this.maxqlen = -1;
    this.dest = this.entity = null;
    this.statTable = $("#server_stats").clone().attr("id", a.name);
    this.statTable.find("h2").text(a.name);
    $("#results").append(this.statTable);
    this.statRef = [
        this.statTable.find("#arrival"), 
        this.statTable.find("#drop"), 
        this.statTable.find("#sutil"), 
        this.statTable.find("#qtime"), 
        this.statTable.find("#stime"), 
        this.statTable.find("#qsize"), 
        this.statTable.find("#ssize"), 
        this.statTable.find("#qtimed"), 
        this.statTable.find("#stimed"),
        this.statTable.find("#qsized"), 
        this.statTable.find("#ssized")
    ];
	this.stat={}
	this.backStats = []
    this.view.image.attr({
        //TODO something
    })
}

StackModel.prototype.jsonify = function() {
    return {
        nservers: this.nservers,
        maxqlen: this.maxqlen,
		distribution: this.distribution,
		params: this.params
    }
};

StackModel.prototype.clearAndUpdateForm = function () {

};

StackModel.prototype.start = function() {
    this.entity = QueueApp.sim.addEntity(StackEntity, this.distribution, this.params, this.nservers, this.maxqlen)
};

StackModel.prototype.connect = function() {
    this.entity.dest = this.dest ? this.dest.entity : null
};

StackModel.prototype.showSettings = function() {
    var a = $("#server_form");
    QueueApp.form_view = this.view;
	a.find("#server_form_distribution").val(this.distribution);
	if(this.params.length == 2){
		a.find("#server_form_param1").val(this.params[0])
		a.find("#server_form_param2").val(this.params[1])
	}
	else if(this.params.length == 1){
		a.find("#server_form_param1").val(this.params[0])
	}
    a.find("#queue_length").val(this.maxqlen);
	a.find("#num_servers").val(this.nservers);
    a.show().position({
        of: $(this.view.image.node),
        at: "center center",
        my: "left top"
    })

    displayName(this, "server_name");
};

StackModel.prototype.saveSettings = function() {
    var a = $("#server_form");
	this.distribution = a.find("#server_form_distribution").val();
	this.params = [];
	this.params.push(a.find("#server_form_param1").val());
	this.params.push(a.find("#server_form_param2").val());
	switch(this.distribution){
		case "exponential":
			this.params = [this.params[0], null]
			break
		case "random":
			this.params = [null, null];
			break
		case "gaussian":
			this.params = [this.params[0], this.params[1]];
			break
	}
    this.maxqlen = a.find("#queue_length").val();
    this.view.image.attr({
        title: "Service rate = " + this.mu
    })
    
    rename(this, "server_name");
};

StackModel.prototype.showStats = function() {
    var a = this.entity.facility,
        b = a.queueStats().durationSeries,
        c = a.queueStats().sizeSeries,
        d = a.systemStats().durationSeries,
        e = a.systemStats().sizeSeries,
        a = a.usage() / QueueApp.sim.time() * 100;
	this.stat["arrival"]=["Arrived", this.entity.arrived];
	this.stat['dropped']=["Dropped", this.entity.dropped];
	this.stat["stack use"]=["Usage %",a];
	this.stat["stack time average"]=["Average Time Spent in Stack", b.average()];
	this.stat["stack time deviation"]=["Deviation Time Spent in Stack", b.deviation()];
	this.stat["stack pop average"]=["Average Population in Stack", c.average()];
	this.stat["stack pop deviation"]=["Deviation Population in Stack", c.deviation()];
	this.stat["system time average"]=["Average Time Spent in System",d.average()];
	this.stat["system time deviation"]=["Deviation Time Spent in Entire System", d.deviation()];
	this.stat["system pop average"]=["Average Population in Entire System",e.average()];
	this.stat["system pop deviation"]=["Deviation Population in Entire System",e.deviation()];
		
    this.statRef[0].text(this.stat["arrival"][1]);	
    this.statRef[1].text(this.stat["dropped"][1]);
    this.statRef[2].text(this.stat["stack use"][1].toFixed(1) + "%");
    this.statRef[3].text(this.stat["stack time average"][1].toFixed(3));
    this.statRef[4].text(this.stat["system time average"][1].toFixed(3));
    this.statRef[5].text(this.stat["stack pop average"][1].toFixed(3));
    this.statRef[6].text(this.stat["system pop average"][1].toFixed(3));
    this.statRef[7].text(this.stat["stack time deviation"][1].toFixed(3));
    this.statRef[8].text(this.stat["system time deviation"][1].toFixed(3));
    this.statRef[9].text(this.stat["stack pop deviation"][1].toFixed(3));
    this.statRef[10].text(this.stat["system pop deviation"][1].toFixed(3));
    this.view.showCounters(b.count(), d.count())
	
    //call animation manager funtion
    var value = a.toFixed(1);
    stat_animation_manager(this.view.image.node.id, "stack", value);
    
};

StackModel.prototype.saveStats = function(){
	tempstr = ""
	for(var k in this.stat){
		if(this.stat.hasOwnProperty(k)){
			tempstr = tempstr + "  " + this.stat[k][0] + ": " + this.stat[k][1] + "\n"
		}
	}
	return tempstr
};

StackModel.prototype.unlink = function() {
    this.statTable.remove();
    this.stat = this.view = this.statRef = null
};

var StackEntity = {
    start: function(a, b, c, d) {
		//Arguments: distribution, parameters for distribution,  nservers, maxnum in queue
        this.facility = new Sim.Facility("queue", Sim.Facility.LCFS, c, d);
		//(Name, Facility type, number of servers, maximum number in queue)
        this.arrived = this.dropped = 0
		
		this.distribution = a
		this.params = b
		//debug
		this.remainder = 0
		this.udoval = []
    },
    onMessage: function(sender, message) {
        this.arrived++;
		this.remainder++
		var timeval = 0
		if(this.distribution === "custom"){
			timeval = message.fields[this.params[0]]
		}else{
			timeval = randDist(this.distribution, this.params, QueueApp.random)
		}
		this.udoval.push(timeval)
        this.useFacility(this.facility, timeval).done(this.completed, this, message)
    },
    completed: function(message) {
		this.remainder -= 1
        this.callbackMessage === -1 ? this.dropped++ : this.dest && this.send(message, 0, this.dest)
    }
};


