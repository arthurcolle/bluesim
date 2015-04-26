
function FuncModel(a) {
    this.view = a;
    this.dest = this.entity = null;
	this.numServed = 0;
	/* field of the UDO to update */
	this.fieldToEdit = "";
	this.op = "";
	this.constant = "";
	/* general function block */
	this.funcString = "";
    this._params = [[]];
    this.view.image.attr({
		title: "Function: " + this.funcString
    })
	this.stat={}
	this._params = null;
}

FuncModel.prototype.createFuncString = function(){
	var re = new RegExp(this.fieldToEdit, "g");
	this.funcString = [this.fieldToEdit, this.op, this.constant].join("").replace(re, "@" + this.fieldToEdit);
};

FuncModel.prototype.jsonify = function() {
	this.createFuncString();
    return {
		fieldToEdit: this.fieldToEdit,
		op: this.op,
		constant: this.constant
    }
};

FuncModel.prototype.start = function() {
	this.createFuncString();
    this.entity = QueueApp.sim.addEntity(FuncEntity, this.funcString, this.fieldToEdit)
};

FuncModel.prototype.connect = function() {
    this.entity.dest = this.dest ? this.dest.entity : null
};

FuncModel.prototype.showSettings = function() {
    pushToForm(this);  
    var a;
    if(USE_UDO){
        displayName(this, "func_block_name");
        createFuncForm();
        
        a = $("#funcblock_form");
        QueueApp.form_view = this.view;

        var num = this._params[0][3];
        var operation = this._params[0][2];
        var fieldName = this._params[0][1]; 
        resetFunc();

        a.find("#funcblock_dropdown_0").val(fieldName);
        a.find("#funcblock_dropdown_1").val(operation);
        a.find("#funcblock_form_param1").val(num)
    } else{
        a = $("#func_form");
        QueueApp.form_view = this.view;
        displayName(this, "func_name");
    }

    a.show().position({
            of: $(this.view.image.node),
            at: "center center",
            my: "left top"
    })

    // shows the name in the func_name input box 
     
};

function resetFunc(){

    var data_type = LIST_OF_PARAMETERS[0][1];
    var b = $("#funcblock_form");
    if(LIST_OF_PARAMETERS[0]){
        b.find("#funcblock_dropdown_0").val(LIST_OF_PARAMETERS[0][0]);
        console.log(data_type);
        if (data_type == "INT"){
            b.find("#addition").show();
            b.find("#subtraction").show();
            b.find("#multiplication").show();
            b.find("#division").show();
            b.find("#modulus").show();
            b.find("#not").hide();
        } else if (data_type == "BOOLEAN"){
            b.find("#addition").hide();
            b.find("#subtraction").hide();
            b.find("#multiplication").hide();
            b.find("#division").hide();
            b.find("#modulus").hide();
            b.find("#not").show();
        } else {
            b.find("#addition").show();
            b.find("#subtraction").show();
            b.find("#multiplication").show();
            b.find("#division").show();
            b.find("#modulus").show();
            b.find("#not").hide();
        }
    }
    else {
        b.find("#funcblock_dropdown_0").val("");
    }
    
    if (data_type != "BOOLEAN"){
        b.find("#funcblock_dropdown_1").val("+");
    } else {
        b.find("#funcblock_dropdown_1").val("!");
    }
    b.find("#funcblock_form_param1").val("");
    
}

function createFuncForm(){

    if(UPDATE_FUNC_FORM == null){
        populateFuncForm();
        UPDATE_FUNC_FORM = "not null";
    }
}

function populateFuncForm(){

    if (USE_UDO){
        var parentForm = document.getElementById("funcblock_dropdown_0");
        console.log("create option for funcblock");
        for (var i =0; i < LIST_OF_PARAMETERS.length;i++){
           // if (LIST_OF_PARAMETERS[i][1] != "BOOLEAN"){

            var option = document.createElement("option");
            option.text = LIST_OF_PARAMETERS[i][0];
            parentForm.add(option);
          // }
        }
        var b = $("#funcblock_form");
        b.find("#funcblock_form_param1").val("");
    }

}

function funcBlockDropdownSwitch(){
    console.log("changing fundblock value");

    if(USE_UDO){
        var b = $("#funcblock_form");
        var data_type;
        var d = document.getElementById("funcblock_dropdown_0");
        var UDOname = d.options[d.selectedIndex].value;
        for(var i = 0; i < LIST_OF_PARAMETERS.length;i++){
            if (LIST_OF_PARAMETERS[i][0] == UDOname){
                data_type = LIST_OF_PARAMETERS[i][1];
            }
        }

        console.log("data changed to: " + data_type);
        if (data_type == "INT"){
            b.find("#addition").show();
            b.find("#subtraction").show();
            b.find("#multiplication").show();
            b.find("#division").show();
            b.find("#modulus").show();
            b.find("#not").hide();
        } else if (data_type == "BOOLEAN"){
            b.find("#addition").hide();
            b.find("#subtraction").hide();
            b.find("#multiplication").hide();
            b.find("#division").hide();
            b.find("#modulus").hide();
            b.find("#not").show();
        } else {
            b.find("#addition").show();
            b.find("#subtraction").show();
            b.find("#multiplication").show();
            b.find("#division").show();
            b.find("#modulus").show();
            b.find("#not").hide();
        }
    }

    if (data_type != "BOOLEAN"){
        b.find("#funcblock_dropdown_1").val("+");
    } else {
        b.find("#funcblock_dropdown_1").val("!");
    }

    // var e = document.getElementById("dropdown_" + index);
    // var dropOption = e.options[e.selectedIndex].value;

    // if (dropOption == "exponential" || dropOption == "constant" || 
    //         dropOption == "pareto"){ // param1 shows but param2 hidden
    //     $("#source_table_" + index + "_param1").show(); 
    //     $("#source_table_" + index + "_param2").hide(); 

    // } else if (dropOption == "random"){ // param1 and param2 both are hidden
    //     $("#source_table_" + index + "_param2").hide();
    //     $("#source_table_" + index + "_param1").hide();
      
    // } else {
    //     //for gaussian, weibull and gamma
    //     $("#source_table_" + index + "_param1").show();  // Both parameters shows up
    //     $("#source_table_" + index + "_param2").show();
    // }

}

FuncModel.prototype.clearAndUpdateForm = function(){
    var a = document.getElementById("funcblock_dropdown_0");
    a.innerHTML = "";
    resetFunc();
    var b = $("#funcblock_form");
    b.find("#funcblock_form_param1").val("");
    $("#funcblock_form").find("#funcblock_form_perc").val("");
    this._params= null;
    populateFuncForm();
}


FuncModel.prototype.saveSettings = function() {
  
    
    if(USE_UDO){
         rename(this, "func_block_name");
        var d = document.getElementById("funcblock_dropdown_0");
        var fieldName = d.options[d.selectedIndex].value;

        var e = document.getElementById("funcblock_dropdown_1");
        var operation = e.options[d.selectedIndex].value;    

        var num = $("#funcblock_form_param1").val();

        this._params = [[]];
        this._params[0][0] = "func";   

        this._params[0][1] = fieldName;
        this._params[0][2] = operation;
        this._params[0][3] = num;
    } else {
        this._params = [[]];
        rename(this, "func_name");
		this.op = "";
		this.fieldToCheck = "";
		this.constant = "";
    }
	pullFromForm(this);
}


FuncModel.prototype.initStats = function(){
	this.stat["function"]=["Function Block",this.entity.funcString]
	for(var property in this.entity.dataCollector){
		if(this.entity.dataCollector.hasOwnProperty(property)){
			dC = this.entity.dataCollector[property]
			this.stat[property] = statman.expandSeries(dC)
		}
	}
}
FuncModel.prototype.showStats = function(){
	/* Should do something in the future.*/
}

FuncModel.prototype.unlink = function() {
    this.view = null
};

var FuncEntity = {
    start: function(a, b) {
		this.funcString = a.replace(/@/g, "message.fields.");
		this.fieldToEdit = b;
		//{property name:time series
		this.dataCollector=statman.initParamSeries()
    },
    onMessage: function(sender, message) {
		if(USE_UDO)
			message.fields[this.fieldToEdit] = eval(this.funcString);
		for(var property in message.fields){
			if(message.fields.hasOwnProperty(property)){
				this.dataCollector[property].record(message.fields[property],this.time());
			}
		}
		
		this.dest && this.send(message, 0, this.dest);
    }
};
