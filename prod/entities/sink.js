function SinkModel(a) {
    this.view = a;
    this.entity = null;
    this.udoStats = []; //udoStats.name, total, min, max
    this.statTable = $("#sink_stats").clone().attr("id", a.name);
    this.statTable.find("h2").text(a.name);
    $("#results").append(this.statTable);
    this.statRef = [this.statTable.find("#depart"), this.statTable.find("#pop"), this.statTable.find("#popd"), this.statTable.find("#stay"), this.statTable.find("#stayd")]
	this.stat = {}
	a.image.attr({
		title: "Sink"
	})
}

SinkModel.prototype.jsonify = function() {
    return null;
};

SinkModel.prototype.start = function() {
    this.entity = QueueApp.sim.addEntity(SinkEntity ,this.udoStats);
    //initialize UDO field statistics
    for(i = 0; i < LIST_OF_PARAMETERS.length; i++){
		this.udoStats.push({
			name:LIST_OF_PARAMETERS[i][0],
			total:0,
			max:null,
			min:null
		})
		/*
    	this.udoStats[i].name = LIST_OF_PARAMETERS[i][0];
    	this.udoStats[i].total = 0;
    	this.udoStats[i].max = null;
    	this.udoStats[i].min = null;
		*/
    }
};


SinkModel.prototype.connect = function() {};


SinkModel.prototype.showSettings = function() {
    var a = $("#sink_form");
    QueueApp.form_view = this.view;
    a.show().position({
        of: $(this.view.image.node),
        at: "center center",
        my: "left top"
    })
    displayName(this, "sink_name");
};

SinkModel.prototype.saveSettings = function() {
    rename(this, "sink_name");
};

SinkModel.prototype.initStats = function(){
	var pop = this.entity.population,
	popDur = pop.durationSeries,
	popSize = pop.sizeSeries
	this.stat["time"]=statman.expandSeries(popDur)
	this.stat["size"]=statman.expandSeries(popSize)
	
	
	for(var property in this.entity.dataCollector){
		if(this.entity.dataCollector.hasOwnProperty(property)){
			dC = this.entity.dataCollector[property]
			this.stat[property] = statman.expandSeries(dC)
		}
	}
}

SinkModel.prototype.clearAndUpdateForm = function(){
	
}

SinkModel.prototype.showStats = function() {
	if(Object.keys(this.stat) > 0){
	    this.statRef[0].text(this.stat.size.count);
		this.statRef[1].text(this.stat.size.average.toFixed(3));
		this.statRef[2].text(this.stat.size.deviation.toFixed(3));
		this.statRef[3].text(this.stat.time.average.toFixed(3));
		this.statRef[4].text(this.stat.time.deviation.toFixed(3));
		this.view.showCounters(this.stat.size.count, NaN)	
		
		//call animation manager function
		var val = this.stat.size.average.toFixed(3)
		stat_animation_manager(this.view.image.node.id, "sink", val);
	}

    
//     if (USE_UDO){
//         //dynamically create information from 
//         //have to do for each UDO? change conditions LIST_OF_PARAMETERS.length or udostats.length
//         //need to check if we have created a table for this yet and update if so
        
//        if (this.statTable.find("#udo_stat_table").val() == undefined){

//     //call animation manager function
        
//         //var parentDiv = document.createElement('div');
//         //parentDiv.id = "udo_stat_table";

// //////////////////////////////////////////////////////////////////////
//  CAN IMPLEMENT TABLE ADDITIONS LIKE THI AS WELL FROM WEB3

//         // Find a <table> element with id="myTable":
//             var table = document.getElementById("myTable");

//         // Create an empty <tr> element and add it to the 1st position of the table:
//             var row = table.insertRow(0);

//         // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
//         var cell1 = row.insertCell(0);
//         var cell2 = row.insertCell(1);

//         // Add some text to the new cells:
//         cell1.innerHTML = "NEW CELL1";
//         cell2.innerHTML = "NEW CELL2";

// //////////////////////////////////////////////////////////////////////////

//         for (var i = 0;i < 3;i++){

//             var newDiv = document.createElement('div');

//             newDiv.innerHTML = ('<table id="test" class="stats_table" border="1">' + 
//             '<tbody>' + 
//             '<tr><td>Name</td><td id="name">0</td><td>-</td></tr>' + 
//             '<tr><td>Population</td><td id="total">0.000</td><td id="popd">NaN</td></tr>' + 
//             '<tr><td>stay duration</td><td id="min">0.000</td><td id="stayd">NaN</td></tr>' + 
//             '<tr><td>stay duration</td><td id="max">0.000</td><td id="stayd">NaN</td></tr>' + 
//         '</tbody></table>'); 

//             //parentDiv.append(newDiv);
//         }
//         //this.statTable.append(parentDiv);

//     }
//     } else {
//         //destroy all the things that we may added
//         this.statTable.find("#udo_stat_table");
// 		/* should delete everything here */
//         //alert("should delete everything here");
//     }

    
};

SinkModel.prototype.unlink = function() {
    this.statTable.remove();
    this.stat = this.view = this.statRef = null
};

var SinkEntity = {
    start: function() {
        this.population = new Sim.Population
		//{property name:time series
		this.dataCollector=statman.initParamSeries()
		
		//debug
		this.statTrack = []
    },
    onMessage: function(sender, message) {
		//message must be a time value
        message || (message.timer = 0);
        this.population.enter(message.timer);
        this.population.leave(message.timer, this.time());
        
		//update udofield stats
        for(var property in message.fields){
			if(message.fields.hasOwnProperty(property)){
				this.dataCollector[property].record(message.fields[property],this.time());
			}
		}
		//debug
		for(var property in message.fields){
			var instProp = []
			if(message.fields.hasOwnProperty(property)){
				instProp.push(message.fields[property])
            }
			this.statTrack.push(instProp)
		}
    }
};


