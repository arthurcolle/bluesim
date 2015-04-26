var SOURCE_DEBUG = false; // set to false to disable logs

function SourceModel(a) {
   // this.updateForm = null;
    this.view = a;
    this.params = [null, null];
    this.distribution = 'random';   
    
    /* this._params = array with the following signature [[distribution, parameter1, parameter2], ...] 
    ** 
    */
    this._params = null;
    
    this.dest = null;
    this.udoFields = {}
    this.view.image.attr({
        title: "Parameters = " + this.params + " Distribution = " + this.distribution
    })
	this.stat={}

    if (SOURCE_DEBUG) console.log("source: SourceModel");
}

SourceModel.prototype.loadUDOFields = function(struct){
    for(prop in struct){
        this.udoFields[prop] = struct[prop];
    }
    if (SOURCE_DEBUG) console.log("source: loadUDOFields");
};

SourceModel.prototype.jsonify = function() {
    this.update();
    return {
        params: this.params,
        distribution: this.distribution,
        udoFields: this.udoFields
    }
    if (SOURCE_DEBUG) console.log("source: jsonify");
};

SourceModel.prototype.start = function() {
    /* ensure that the source is up-to-date on UDO params */
    this.update()
    this.entity = QueueApp.sim.addEntity(SourceEntity, this.distribution, this.params, this.udoFields)
    if (SOURCE_DEBUG) console.log("source: start");
};

SourceModel.prototype.connect = function() {
    this.entity.dest = this.dest ? this.dest.entity : null;
    if (SOURCE_DEBUG) console.log("source: connect");
};

/* 
* in QueueApp whenever fields of UDO are changed, 
* must called this function on all Source models 
* every is set to default here
*
* HERE
* every time user wants to edit params of the source
*/
SourceModel.prototype.update = function() {
    for(var i = 0; i < LIST_OF_PARAMETERS.length; i++){
        var name = LIST_OF_PARAMETERS[i][0];
        var type = LIST_OF_PARAMETERS[i][1];
        /* check existence of field */
        if(this.udoFields[name]){
            /* check for update of field type */
            if(!this.udoFields[name]['type']){
                /* update */
                this.udoFields[name] = {
                    type: type,
                    distribution: 'random',
                    params: [null,null],
                    boolBase: this.udoFields[name]['boolBase'],
                }
            }
        }
        /* create new entry in udo dictionary */
        else{
            this.udoFields[name] = {
                type: type,
                distribution: 'random',
                params: [null,null],
                boolBase: 0
            }
        }
        /* update divs here */
    }
    if (SOURCE_DEBUG) console.log("source: update");
}

/* TODO with frontend */
SourceModel.prototype.showSettings = function() {
	pushToForm(this);
    createForm();

    var a = $("#source_form");
    QueueApp.form_view = this.view;

    if (USE_UDO === true){

        if (this._params == null){

            for (var i = 0; i < LIST_OF_PARAMETERS.length+1;i++ ){
                reset(i);
            }

        } else {

            for (var i = 0; i < this._params.length; i++){
                reset(i);
                var dist = this._params[i][0];
                var param1 = this._params[i][1];
                var param2 = this._params[i][2];
                var dropdown = a.find("#dropdown_" + i).val(dist);
                b = $("#source_table_"+i);

                //distributions with one parameter
                if (dist == "exponential" || dist == "constant" || dist == "pareto"){
                    b.find("#source_form_param1").val(param1).show();
                    $("#source_table_" + i + "_param2").hide(); 
                } else if (dist == "random") {
                    $("#source_table_" + i + "_param1").hide(); 
                    $("#source_table_" + i + "_param2").hide(); 
                } else {
                    $("#source_table_0_param2").show(); 
                    b.find("#source_form_param1").val(param1).show();
                    b.find("#source_form_param2").val(param2).show();
                }
            }
        }
    } else {

      
        if (this._params == null){
            reset(0);
        } else {
            var dist = this._params[0][0];
            var param1 = this._params[0][1];
            var param2 = this._params[0][2];
            var dropdown = a.find("#dropdown_0").val(dist);
            b = $("#source_table_0");

            if (dist == "exponential" || dist == "constant" || dist == "pareto"){
                b.find("#source_form_param1").val(param1).show();
                $("#source_table_0_param2").hide(); 
            } else if (dist == "random") {
                $("#source_table_0_param1").hide(); 
                $("#source_table_0_param2").hide(); 
            } else {
                $("#source_table_0_param2").show(); 
                b.find("#source_form_param1").val(param1).show();
                b.find("#source_form_param2").val(param2).show();
            }
        }
    }

    a.show().position({
        of: $(this.view.image.node),
        at: "center center",
        my: "left top"
    })

    displayName(this, "source_name");
    if (SOURCE_DEBUG) console.log("source: showSettings");
};

/* TODO with frontend */
SourceModel.prototype.saveSettings = function() {
    /* front end needs to promise us divs to access */
    a = $("#source_form")
    
    if (USE_UDO === true){
        var d = document.getElementById("dropdown_0");
        var dist = d.options[d.selectedIndex].value;

        this._params = [];
        //change condition to LIST_OF_PARAMETERS.length
        for (var i = 0;i <LIST_OF_PARAMETERS.length+1; i++){
            
            this._params[i] = [];
           
            
            var d = document.getElementById("dropdown_"+i);
            var dist = d.options[d.selectedIndex].value;    
            this._params[i][0] = (dist);

            b = $("#source_table_"+i)
            this._params[i][1] = (b.find("#source_form_param1").val());
            this._params[i][2] = (b.find("#source_form_param2").val());
        }

        // this.view.image.attr({
        //     title: "Parameters = " + this.params + " Distribution = " + this.distribution
        // })
    } else {

        this._params = [];
        this._params[0] = [];

        var d = document.getElementById("dropdown_0");
        var dist = d.options[d.selectedIndex].value;    
        this._params[0][0] = (dist);

        b = $("#source_table_0")
        this._params[0][1] = (b.find("#source_form_param1").val());
        this._params[0][2] = (b.find("#source_form_param2").val());

        // this.view.image.attr({
        //     title: "Parameters = " + this.params + " Distribution = " + this.distribution
        // })
    }

 
    rename(this, "source_name");
    if (SOURCE_DEBUG) console.log("source: saveSettings");

	this.update();
	pullFromForm(this);

};

function reset(i){
    
    a = $("#source_form");
    a.find("#dropdown_" + i).val("constant");
    b = $("#source_table_"+i)
    $("#source_table_" + i + "_param1").show();
    $("#source_table_" + i + "_param2").hide()
    b.find("#source_form_param1").val("").show();
    if (SOURCE_DEBUG) console.log("source: reset");
}

SourceModel.prototype.unlink = function() {
    console.log("link");
    this.view = null
    if (SOURCE_DEBUG) console.log("source: unlink");
};

SourceModel.prototype.initStats = function(){
	this.stat["spawn"]=["Spawned", this.entity.spawn];
	for(var property in this.entity.dataCollector){
		if(this.entity.dataCollector.hasOwnProperty(property)){
			dC = this.entity.dataCollector[property]
			this.stat[property]=statman.expandSeries(dC)
		}
	}
}

SourceModel.prototype.showStats = function() {
    this.view.showCounters(NaN, this.entity.generated)
	
    //call animation manager funtion
   // var value = a.toFixed(1);
    stat_animation_manager(this.view.image.node.id, "source", 100);
    if (SOURCE_DEBUG) console.log("source: showStats");
};

var SourceEntity = {
    start: function(a, b, c) {
        //Arguments: this.distribution, this.params, udofields
        this.distribution = a
        this.params = b;
        this.message = null;
        this.spawn = 0
        this.udoFields = c;
		// this.updateForm = null;
		//{property name:time series
		this.dataCollector=statman.initParamSeries()
		this.setTimer(0).done(this.traffic);
    },
    /* actual data generation */
    traffic: function() {
        if(!this.dest){
            return;
        }
		this.message = new Data();
		for(var property in this.message.fields){
			if(this.message.fields.hasOwnProperty(property)){
				this.message.fields[property] = randDist(
					this.udoFields[property].distribution,
					this.udoFields[property].params,
					QueueApp.random
				);
				/*
				type checking
					BOOLEAN (compares value to boolBase)
					INT (Round)
					FLOAT (does nothing)
				*/
                switch(this.udoFields[property]['type']){
                    case "BOOLEAN":
                        this.message.fields[property] = 
                        (this.message.fields[property] > this.udoFields[property][boolBase]);
						break;
					case "INT":
					//this basically strips the number to an int same way other programs do it.
						this.message.fields[property] =
							this.message.fields[property] >> 0;
						break;
				}
				this.dataCollector[property].record(this.message.fields[property],this.time());
            }
        }
        this.message.timer = this.time();
        this.send(this.message,0,this.dest);
        this.spawn++;
        this.setTimer(randDist(this.distribution, this.params, QueueApp.random)).done(this.traffic)
    }
};

function createForm(){

    //check created so that we don't update the form over and over
    if(UPDATE_FORM == null){
        populateForm();
        UPDATE_FORM = "not null";
    }
}




//fills form with functionand parameters based on UDO if 
function populateForm(){
    var parentForm = document.getElementById("source_form_to_append");
    console.log("populateForm");
    //create new form for source if UDO exists
    if (USE_UDO){

        console.log("creating source form for UDO");
        //change condition to be LIST_OF_PARAMETERS.length + 1;
        for (var i = 0; i<LIST_OF_PARAMETERS.length+1;i++){

            var newDiv = document.createElement('div');
            newDiv.id = "source_table_" + i;

            //use to display information to user for how to fill out source form use UDO field from LIST_OF_PARAMTERS[i-1][0]; instead of i
            var user_message = i == 0? "Choose your distribution function for spawning UDOs" : "Choose distribution function for "+ LIST_OF_PARAMETERS[i-1][0];
            newDiv.innerHTML = '<table>'  +
              '<tr>' +
                    '<td><label for="source_form_distribution">' + user_message + '</label></td>' +
                    '<td><select name="source_dropdown_'+ i + '" id="dropdown_' + i + '" onChange="dropper('+ i +')" class="text ui-widget-content ui-corner-all">' + 
                            '<option value="constant">Constant</option>' +
                            '<option value="gaussian">Gaussian</option>' + 
                            '<option value="exponential">Exponential</option>' +
                            '<option value="pareto">Pareto</option>' +
                            '<option value="random">Random</option>' +
                            '<option value="gamma">Gamma</option>' +
                            '<option value="weibull">Weibull</option>' +
                        '</select>' + 
                    '</td></tr>' +
                '<tr id="source_table_'+ i + '_param1">' +
                    '<td><label for="source_form_param1">Parameter 1</label></td>' +
                    '<td><input type="text" name="source_form_param1" id="source_form_param1" value="" class="text ui-widget-content ui-corner-all"></td></tr>' +
                '<tr id="source_table_'+ i + '_param2" style="display: none">' +
                    '<td><label for="source_form_param2">Parameter 2</label></td>' +
                    '<td><input type="text" name="source_form_param2" id="source_form_param2" value="" class="text ui-widget-content ui-corner-all"></td></tr>' + 
            '</table>';
            
            parentForm.appendChild(newDiv);
        }
    } else {
        console.log("create form for Ping");    
        var i = 0;

        var newDiv = document.createElement('div');
            newDiv.id = "source_table_0";

        newDiv.innerHTML = '<table>'  +
          '<tr>' +
                '<td><label for="source_form_distribution">Choose your distribution function</label></td>' +
                '<td><select name="source_dropdown_'+ i + '" id="dropdown_' + i + '" onChange="dropper('+ i +')" class="text ui-widget-content ui-corner-all">' + 
                        '<option value="constant">Constant</option>' +
                        '<option value="gaussian">Gaussian</option>' + 
                        '<option value="exponential">Exponential</option>' +
                        '<option value="pareto">Pareto</option>' +
                        '<option value="random">Random</option>' +
                        '<option value="gamma">Gamma</option>' +
                        '<option value="weibull">Weibull</option>' +
                    '</select>' + 
                '</td></tr>' +
            '<tr id="source_table_'+ i + '_param1">' +
                '<td><label for="source_form_param1">Parameter 1</label></td>' +
                '<td><input type="text" name="source_form_param1" id="source_form_param1" value="" class="text ui-widget-content ui-corner-all"></td></tr>' +
            '<tr id="source_table_'+ i + '_param2" style="display: none">' +
                '<td><label for="source_form_param2">Parameter 2</label></td>' +
                '<td><input type="text" name="source_form_param2" id="source_form_param2" value="" class="text ui-widget-content ui-corner-all"></td></tr>' + 
        '</table>';
        
        parentForm.appendChild(newDiv);

    }
}


function dropper(index){

    var e = document.getElementById("dropdown_" + index);
    var dropOption = e.options[e.selectedIndex].value;

    if (dropOption == "exponential" || dropOption == "constant" || 
            dropOption == "pareto"){ // param1 shows but param2 hidden
        $("#source_table_" + index + "_param1").show(); 
        $("#source_table_" + index + "_param2").hide(); 

    } else if (dropOption == "random"){ // param1 and param2 both are hidden
        $("#source_table_" + index + "_param2").hide();
        $("#source_table_" + index + "_param1").hide();
      
    } else {
        //for gaussian, weibull and gamma
        $("#source_table_" + index + "_param1").show();  // Both parameters shows up
        $("#source_table_" + index + "_param2").show();
    }

}



//clearing the form to be updated again form new UDO information.
// this function is very primitive at the moment
SourceModel.prototype.clearAndUpdateForm = function(){
    var a = document.getElementById("source_form_to_append");
    a.innerHTML = "";

    populateForm();
    if (SOURCE_DEBUG) console.log("source: clearAndUpdateForm");
}


