function SplitFuncModel(a) {
    this.view = a;
    this.dest = [null, null];
    this._params = [[]];
    this.funct = null;
    this.prob = 0.5;
    var b = ["Splitting", this.prob * 100, "% / ", 100 - this.prob * 100, "%"].join(" ");
    a.image.attr({
        title: b
    })
    this._params[0][0] = "func";
	this.stat={}

	this.fieldToCheck = "";
	this.op = "";
	this.constant = "";
}

SplitFuncModel.prototype.createFuncString = function(){
	var re = new RegExp(this.fieldToCheck, "g");
    this.funct = [this.fieldToCheck, this.op, this.constant].join("");
	this.funct = this.funct.replace(re, "@" + this.fieldToCheck);
};

SplitFuncModel.prototype.jsonify = function() {
	this.createFuncString();
    return {
		fieldToCheck: this.fieldToCheck,
    	prob: this.prob,
		op: this.op,
		constant: this.constant
    }
};

SplitFuncModel.prototype.start = function() {
	this.createFuncString();
    this.entity = QueueApp.sim.addEntity(SplitFuncEntity, this.funct, this.fieldToCheck, this.prob);
};

SplitFuncModel.prototype.connect = function() {
    this.entity.dest1 = this.dest[0] ? this.dest[0].entity : null;
    this.entity.dest2 = this.dest[1] ? this.dest[1].entity : null;
};

SplitFuncModel.prototype.showSettings = function() {
	pushToForm(this);        
    var a;
    if(USE_UDO){
        createSplitForm();
        
        a = $("#splitfunc_form");
        QueueApp.form_view = this.view;

        if (this._params == null){
            resetSplit();
        } else {
            resetSplit();
            var num = this._params[0][3];
            var operation = this._params[0][2];
            var fieldName = this._params[0][1]; 
            a.find("#splitfunc_dropdown_0").val(fieldName);
            a.find("#splitfunc_dropdown_1").val(operation);
            a.find("#splitfunc_form_param1").val(num)
        }
    } else{
        a = $("#splitter_form");
        QueueApp.form_view = this.view;
        if (this._params != null){
            a.find("#splitter_form_perc").val(this._params[0][3]);
        }
    }

    a.show().position({
            of: $(this.view.image.node),
            at: "center center",
            my: "left top"
    })
};

function resetSplit(){

    var b = $("#splitfunc_form");
    if(LIST_OF_PARAMETERS[0]){
    	b.find("#splitfunc_dropdown_0").val(LIST_OF_PARAMETERS[0][0]);
	}
    else {
    	b.find("#splitfunc_dropdown_0").val("");
    }
    	
    b.find("#splitfunc_dropdown_1").val(">");
    b.find("#splitfunc_form_param1").val("");
}

function createSplitForm(){

    if(UPDATE_SPLIT_FORM == null){
        populateSplitForm();
        UPDATE_SPLIT_FORM = "not null";
    }
}

function populateSplitForm(){

    var parentForm = document.getElementById("splitfunc_dropdown_0");
    console.log("create option for splitfunc");
    for (var i =0; i < LIST_OF_PARAMETERS.length;i++){
        if (LIST_OF_PARAMETERS[i][1] != "BOOLEAN"){

            var option = document.createElement("option");
            option.text = LIST_OF_PARAMETERS[i][0];
            parentForm.add(option);
        }
    }
    var b = $("#splitfunc_form");
    b.find("#splitfunc_form_param1").val("");

}

SplitFuncModel.prototype.clearAndUpdateForm = function(){
    var a = document.getElementById("splitfunc_dropdown_0");
    a.innerHTML = "";

    var b = $("#splitfunc_form");
    b.find("#splitfunc_form_param1").val("");
    $("#splitter_form").find("#splitter_form_perc").val("");
    this._params= null;
    populateSplitForm();
}


SplitFuncModel.prototype.saveSettings = function() {
	
    if(USE_UDO){
        var d = document.getElementById("splitfunc_dropdown_0");
        var fieldName = d.options[d.selectedIndex].value;

        var e = document.getElementById("splitfunc_dropdown_1");
        var operation = e.options[e.selectedIndex].value;    

        var num = $("#splitfunc_form_param1").val();

        this._params = [[]];
        this._params[0][0] = "func";   

        this._params[0][1] = fieldName;
        this._params[0][2] = operation;
        this._params[0][3] = num;
    } else {
        this._params = [[]];
        this._params[0][3] = $("#splitter_form").find("#splitter_form_perc").val();
		this.fieldToCheck = "";
		this.op = "";
		this.constant = "";
    }

    
///////////// BACKEN/.///D: if UDO is not being used, this._param[0][3] constains user input for traffic flow
    
	pullFromForm(this);

    var b = "";
    if(fieldName != null) {
    	b = ["Splitting", this.funct].join(" ");
    }
    else {
    	this.funct = null;
    	this.prob = num;
    	b = ["Splitting", this.prob * 100, "% / ", 100 - this.prob * 100, "%"].join(" ");
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.view.image.attr({
        title: b
    })
};

SplitFuncModel.prototype.unlink = function() {
    this.view = null
};

SplitFuncModel.prototype.initStats = function(){
	for(var property in this.entity.dataCollector){
		if(this.entity.dataCollector.hasOwnProperty(property)){
			dC = this.entity.dataCollector[property]
		}
	}
	
}

SplitFuncModel.prototype.showStats = function() {
	/* make sure this.stat is initalized prior to making calls to it.*/
	
	
    //call animation manager funtion
    //var value = a.toFixed(1);
    stat_animation_manager(this.view.image.node.id, "splitfunc", 100);
};

var SplitFuncEntity = {
        start: function(funct, fieldToCheck, prob) {
            this.to2 = this.to1 = this.arrived = 0;
			this.fieldToCheck = fieldToCheck;
			this.prob = prob
			if(USE_UDO)
				this.funcString = funct.replace(/@/g, 'message.fields.');
			else
				this.funcString = 'QueueApp.random.uniform(0,1) < this.prob';
			//{property name:time series
			this.dataCollector=statman.initParamSeries()
        },
        onMessage: function(sender, message) {
            this.arrived++;
			//We assume true route to to1 and false to route to to2
			//We also assume that this.funct will always return true/false
			if(eval(this.funcString)){
				(this.to1++, this.dest1 && this.send(message, 0, this.dest1)) 
			} else {
				(this.to2++, this.dest2 && this.send(message, 0, this.dest2))
			}
			for(var property in message.fields){
				if(message.fields.hasOwnProperty(property)){
					this.dataCollector[property].record(message.fields[property],this.time());
				}
			}	
        }
    },
    SplitFuncView = function(a, b, c, d, e) {
        this.canvas = a;
        this.type = b;
        this.name = c;
        this.hidden = [a.rect(d, e, 10, 10), a.rect(d, e, 10, 10)];
        this.width = 28.7;
        this.height = 48 * 0.7;
        this.image = a.image("images/splitter.png", d, e, this.width, this.height);
        this.x = d;
        this.y = e;
        this.hidden[0].attr({
            "stroke-width": "0"
        });
        this.hidden[1].attr({
            "stroke-width": "0"
        });
        this.image.attr({
            cursor: "move"
        });
        this.image.view = this;
        this.image.animate({
            scale: "1.2 1.2"
        }, 200, function() {
            this.animate({
                scale: "1 1"
            }, 200)
        });
        this.arrows = [null, null];
        this.counters = a.text(d, e, "");
        for (b = 0; b < 2; b++) c = a.image("images/orange-arrow.gif", d, e, 12, 12), c.view = this, c.id = b, c.drag(function(a, b) {
            this.attr({
                x: this.ox + a,
                y: this.oy + b
            });
            this.paper.connection(this.conn)
        }, function() {
            this.conn = this.paper.connection(this.view.hidden[this.id], this, "#000");
            this.ox = this.attr("x");
            this.oy = this.attr("y")
        }, function() {
            this.conn.line.remove();
            this.conn = null;
            var a = QueueApp.views,
                b = a.length,
                c = this.attr("x"),
                d = this.attr("y");
            for (b -= 1; b >= 0; b--) {
                var e = a[b];
                if (e.acceptDrop(c, d)) {
                    this.hide();
                    this.view.connect(e, this.id);
                    return
                }
            }
            a = this.view;
            this.id === 0 ? this.attr({
                x: a.x + a.width + 2,
                y: a.y + 5
            }) : this.attr({
                x: a.x + a.width + 2,
                y: a.y + a.height - 15
            })
        }), this.arrows[b] = c;
        this.moveto(d, e);
        this.image.drag(function(a, b) {
                var c = this.view;
                c.moveto(c.ox + a, c.oy + b)
            }, function() {
                var a = this.view;
                a.ox = a.x;
                a.oy = a.y
            },
            function() {});
        this.image.dblclick(function() {
            this.view.model.showSettings()
        })
    };

SplitFuncView.prototype.moveto = function(a, b) {
    var c;
    if (!(a > 800 - this.width || b > 400 - this.height || a < 0 || b < 0)) {
        this.x = a;
        this.y = b;
        this.image.attr({
            x: a,
            y: b
        });
        this.hidden[0].attr({
            x: this.x + this.width - 20,
            y: this.y + 5
        });
        this.hidden[1].attr({
            x: this.x + this.width - 20,
            y: this.y + this.height - 15
        });
        this.arrows[0].attr({
            x: this.x + this.width + 2,
            y: this.y + 5
        });
        this.arrows[1].attr({
            x: this.x + this.width + 2,
            y: this.y + this.height - 15
        });
        this.counters.attr({
            x: this.x + this.width / 2,
            y: this.y + this.height + 5
        });
        for (c = QueueApp.views.length - 1; c >= 0; c--) QueueApp.views[c].moveConnection(this);
        this.arrows[0].conn && this.canvas.connection(this.arrows[0].conn, 0, 0, 0, 0, this.arrows[0].conn.toView.type == "reverser");
        this.arrows[1].conn && this.canvas.connection(this.arrows[1].conn, 0, 0, 0, 0, this.arrows[1].conn.toView.type == "reverser");
    }
};

SplitFuncView.prototype.connect = function(a, b) {
    var c = this.canvas.connection(this.hidden[b], a.dropObject(), "#000", 0, 0, a.type == "reverser");


     c.line.node.setAttribute("data-from",this.image.node.id);  //adds where the path is coming from
     c.line.node.setAttribute("data-to",a.image.node.id);       //adds where the path is going to

    c.line.attr({
        "stroke-width": 3,
        stroke: "#F7D68A"
    });
//    c.line.node.id = getID();     //here  SplitFunc
    c.fromView = this;
    c.toView = a;
    this.arrows[b].conn = c;
    this.arrows[b].hide();
    this.model.dest[b] = a.model
};

SplitFuncView.prototype.unlink = function() {
    var a, b;
    a = QueueApp.models.length;
    for (a -= 1; a >= 0; a--)
        if (QueueApp.models[a] === this.model) {
            b = a;
            break;
        }
    b && QueueApp.models.splice(b, 1);
    this.model && this.model.unlink();
    this.disconnect();
    a = QueueApp.views.length;
    for (a -= 1; a >= 0; a--) QueueApp.views[a].disconnect(this), QueueApp.views[a] === this && (b = a);
    QueueApp.views.splice(b, 1);
    this.image.remove();
    this.arrows[0].remove();
    this.arrows[1].remove();
    this.hidden[0].remove();
    this.hidden[0].remove();
    this.counters.remove()
};

SplitFuncView.prototype.disconnect = function(a) {
    for (var b = 0; b < 2; b++) {
        var c = this.arrows[b];
        if (c && c.conn && (!a || c.conn.toView === a)) c.conn.line.remove(), c.conn = null, b === 0 ? c.attr({
            x: this.x + this.width + 2,
            y: this.y + 5
        }) : c.attr({
            x: this.x + this.width + 2,
            y: this.y + this.height - 15
        }), c.show()
    }
};

SplitFuncView.prototype.dropObject = function() {
    return this.image
};

SplitFuncView.prototype.acceptDrop = function(a, b) {
    return a > this.x - 10 && a < this.x + this.width + 10 && b > this.y - 10 && b < this.y + this.height + 10
};

SplitFuncView.prototype.moveConnection = function(a) {
    for (var b = 0; b < 2; b++) {
        var c = this.arrows[b];
        c && c.conn && c.conn.toView === a && this.canvas.connection(c.conn, 0, 0, 0, 0, a.type == "reverser")
    }
};

SplitFuncView.prototype.jsonify = function() {
    for (var a = {
            x: this.x,
            y: this.y,
            type: this.type,
            name: this.name,
            out: [null, null]
        }, b = 0; b < 2; b++) {
        var c = this.arrows[b];
        if (c.conn) a.out[b] = c.conn.toView.name
    }
    if (this.model) a.model = this.model.jsonify();
    return a
};
