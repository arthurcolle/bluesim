var QueueApp = {
    debug: true,
    init: function() {
        //console.log("init");
        this.canvas = Raphael("canvas", CANVAS_W, CANVAS_H);

        $("#clear_screen").button({
        }).click(function() {
            bootbox.confirm("Do you wish to clear the screen?", function(result) {
                QueueApp.reset()
            }); 
        });
        $("#import_file").click(function() {
            bootbox.prompt("Enter your simulation JSON string", function(result) {                
              if (result !== null) {      
                QueueApp.loadtext(result);
              }
            });
        });
        
        $("#export_file").click(function() {
            bootbox.prompt({
              title: "Here's your simulation",
              value: QueueApp.stringify(),
              callback: function(result) {
              }
            });
        });

        // $("#export_file").click(function() {
        //     var client = new ZeroClipboard( document.getElementById("export_file") );

        //     client.on( "ready", function( event ) {
        //       // alert( "ZeroClipboard SWF is ready!" );

        //         client.on( 'copy', function(event) {
        //             event.clipboardData.setData('text/plain', QueueApp.stringify());
        //         });

        //           client.on( "aftercopy", function( event ) {
        //             event.target.style.display = "none";
        //             alert("Copied text to clipboard: " + event.data["text/plain"] );
        //           } );
        //     } );


            // client.on( "mouseover", function( readyEvent ) {
            //     client.on( "copy", function (event) {
            //       var clipboard = event.clipboardData;
            //       clipboard.setData( "text/plain", QueueApp.stringify() );
            //       console.log(QueueApp.stringify());
            //     });

            //   client.on( "aftercopy", function( event ) {
            //     // `this` === `client`
            //     // `event.target` === the element that was clicked
            //     event.target.style.display = "none";
            //     alert("Copied text to clipboard: " + event.data["text/plain"] );
            //   });
            // });
        
        $("#verify_clear").dialog({
            autoOpen: !1,
            width: 250,
            modal: !0,
            resizable: !1,

              buttons: {
                Cancel: function() {
                    $(this).dialog("close")
                },
                Ok: function() {
                    $(this).dialog("close");
                    QueueApp.reset(!0)
                }
            }
        });
        
        $("#save_dialog").dialog({
            autoOpen: !1,
            width: CANVAS_W / 2,
            modal: !0,
            resizable: !1
        });

        $("#download_json").click(function(){
            blueSimDownload("JSON", "sim.json", "");
        });
        
        $("#load_dialog").dialog({
            autoOpen: !1,
            width: CANVAS_W / 2,
            modal: !0,
            resizable: !1,
            buttons: 
            {
                Cancel: function() {
                    $(this).dialog("close")
                },
                Load: function() {
                    $(this).dialog("close");
                    QueueApp.reset(!0);
                    QueueApp.loadtext($("#load_textarea").val())
                }
            }
        });

         $("#add_udo").click(function() {
            setUDO();
        });
        
        $("#play_sim").click(function() {
            QueueApp.startSim();
        });

        $("#config_sim").button({
            icons: {
                primary: "ui-icon-clock"
            }
        }).click(function() {
            //console.log("config");
            QueueApp.showSimProperties()
        });

        $("#sim_ops").buttonset();
        
        $("#pause_sim").button({
            text: !1,
            icons: {
                primary: "ui-icon-pause"
            }
        }).click(function() {
            QueueApp.paused ? (QueueApp.paused = !1, $("#pause_sim").button("option", "icons", {
                primary: "ui-icon-pause"
            }), QueueApp.run()) : ($("#pause_sim").button("option", "icons", {
                primary: "ui-icon-play"
            }), QueueApp.paused = !0)
        });

        $("#stop_sim").button({
            text: !1,   
            icons: {
                primary: "ui-icon-stop"
            }
        }).click(function() {
            QueueApp.playing = !1;
            QueueApp.paused && QueueApp.complete()
        });

        $("#sim_play_ops").buttonset().hide();
        this.progress = $("#progressbar");
        this.progress.progressbar().hide();

        $(".settings_form_delete").button({
            icons: {
                primary: "ui-icon-trash"
            }
        }).click(function() {
            QueueApp.form_view.unlink();
            $(this).parent().hide()
        });
        
        $(".settings_form_disconnect").button().click(function() {
            QueueApp.form_view.disconnect();
            $(this).parent().hide()
        });
        
        $(".settings_form_save").button().click(function() {
            QueueApp.form_view.model.saveSettings();
            $(this).parent().hide()
        });
        
        $(".settings_form").hide();
        $(".settings_form_close").button({
            icons: {
                primary: "ui-icon-close"
            },
            text: !1
        }).click(function() {
            $(this).parent().hide()
        });

        $("#simulation_dialog_save").button().click(function() {
            $(this).parent().hide();
            QueueApp.saveSettings()
        });
        
        this.reset()
    },
    reset: function(a) {
        //console.log("reset");
        function b(a, b, c, d) {
            a.drag(function(a, b) {
                var c = this.ox + a,
                    d = this.oy + b;
                c < 0 || c > (CANVAS_W -40) || d < 0 || d > (CANVAS_H - 40) || this.attr({
                    x: this.ox + a,
                    y: this.oy + b
                })
            }, function() {
                this.ox = this.attr("x");
                this.oy = this.attr("y")
            }, function() {
                var a = this.attr("x"),
                    f = this.attr("y");
                this.attr({
                    x: b,
                    y: c
                });
                a < 60 && f < 200 && (f = a = null);
                d.call(QueueApp, a, f)
            })
        }
        if (!this.debug && !a &&
            this.views && this.views.length != 0) $("#verify_clear").dialog("open");
        else {
            if (this.models) {
                a = this.models.length;
                for (a -= 1; a >= 0; a--) this.models[a].unlink && this.models[a].unlink()
            }
            this.sim = null;
            this.until = 28800;
            this.seed = (new Date).getTime();
            this.showConn = !1;

            this.func_id = 0;
            this.sink_id = 0;
//          this.splitter_id = 0;
//          this.splitter3_id = 0;
            this.source_id = 0;
            this.server_id = 0;
//          this.stack_id = 0;
            this.splitfunc_id = 0;
//          this.switch_id = 0;
            this.reverser_id = 0;
            this.thermometer_id = 0;

            this.canvas.clear();
            this.posx = 100;
            this.posy = 50;
            this.views = [];
            this.models = [];
            this.form_view = null;
            this.canvas.rect(0, 0, CANVAS_W, CANVAS_H).attr({
                fill: "#EEEEEE",
                "fill-opacity": ".8"
            });
            for (var c = [], a = 0; a <= CANVAS_W; a += 50) c.push("M" +
                a + " 0L" + a + " " + CANVAS_H), c.push("M0 " + a + "L"+CANVAS_W+" " + a);
            this.canvas.path(c.join("")).attr({
                "stroke-width": 0.1,
                stroke: "blue"
            });
            this.canvas.path("M0 0L0 "+ CANVAS_H +"L"+CANVAS_W+" "+CANVAS_H+"L"+ CANVAS_W+" 0L0 0").attr({
                "stroke-width": 1,
                stroke: "blue"
            });

            var numRect = 7;
            for (a = 0; a < numRect; a++) this.canvas.rect(numRect, 10 + 50 * a, 35, 50).attr({
                // fill: "#FAF6AA",
                fill: "#FFFFEE",
                "fill-opacity": "50",
                stroke: "black"
            });



            a = this.parseTime(this.until);
            // $("#config_sim").button("option", "label", a[0].toFixed(3) + " " + a[1]);   


            $("#config_label").text(a[0].toFixed(3) + " " + a[1]);
            
            var source = this.canvas.image("images/source.png",       12.5, 25, 25, 25);
            b(source, 15, 25, QueueApp.newSource);
            source.attr({
                title: "Drag and drop to create a new Source"
            });

            var queue = this.canvas.image("images/queue.png",         12.5, 75, 25, 25);
            b(queue, 15, 70, QueueApp.newServer);
            queue.attr({
                title: "Drag and drop to create a new Queue"
            });

            var func = this.canvas.image("images/function.png",         12.5, 130, 25, 15);
            b(func, 12.5, 130, QueueApp.newFunc);
            func.attr({
                title: "Drag and drop to create a new Function"
            });

            // var stack = this.canvas.image("images/stack.png",         12.5, 125, 25, 25);
            // b(stack, 15, 115, QueueApp.newStack);
            // stack.attr({
            //     title: "Drag and drop to create a new Stack"
            // });

            var sink = this.canvas.image("images/sink.png",           12.5, 175, 25, 25);
            b(sink, 15, 165, QueueApp.newSink);
            sink.attr({
                title: "Drag and drop to create a new Sink"
            });

            var splitfunc = this.canvas.image("images/splitter2.png", 12.5, 225, 25, 25);
            b(splitfunc, 15, 215, QueueApp.newSplitFunc);
            splitfunc.attr({
                title: "Drag and drop to create a new Split Function"
            });

            var thermometer = this.canvas.image("images/thermometer.png", 12.5, 275, 25, 25);
            b(thermometer, 15, 265, QueueApp.newThermometer);
            thermometer.attr({
                title: "Drag and drop to create a new three way Thermometer"
            });


            // var splitter3 = this.canvas.image("images/splitter3.png", 15, 265, 32, 32);
            // b(splitter3, 15, 265, QueueApp.newSplitter3);
            // splitter3.attr({
            //     title: "Drag and drop to create a new three way Splitter"
            // });


            
            $("#about_this_model").hide()
        }
    },
    updateDrop: function() {
        //console.log("updateDrop");
        this.posx += 20;
        this.posy += 20;
        if (this.posy > 360) this.posy = 20, this.posx -= 200
    }, 
    newView: function(a, b, c, d, e, f, g, i) {
        //console.log("newView");

    //(a=ImageView, b=Entity Model, c=type name, d=instance name, e=hasInput , f=hasOutput , g=x position, i=y position)
    // !0 = true and !1 = false.  Don't ask me why they do this.

        if (!g) g = this.posx, i = this.posy, this.updateDrop();

        a = new a(this.canvas, c, d, g, i, e, f);
       
        
        /* Create an ID tag for the entity image to use the naming convention "entity_(num)_img"
           adding id tag here because splitter and splitfunc do not seem to use the typical
           imageview creation */
           
        var temp = a.image.node.id = d + "_img";
        a.id = temp;

        this.showConn && a.showDots(!0);
        this.views.push(a);
        b = new b(a);
        a.model = b;
        this.models.push(b);

        return a;
    },
    newServer: function(a, b) {
        this.server_id++;
        return this.newView(ImageView, ServerModel, "queue", "queue_" + this.server_id, !0, !0, a, b);
    },
    newSource: function(a, b) {
        this.source_id++;
        return this.newView(ImageView, SourceModel, "source", "source_" + this.source_id, !1, !0, a, b);
    },
    newSink: function(a, b) {
        this.sink_id++;
        return this.newView(ImageView, SinkModel, "sink", "sink_" + this.sink_id, !0, !1, a, b);
    },
    // newSplitter: function(a, b) {
    //     this.splitter_id++;
    //     return this.newView(SplitterView, SplitterModel, "splitter", "splitter_" + this.splitter_id, !0, !0, a, b)
    // },
    // newSplitter3: function(a,b) {
    //     this.splitter3_id++;
    //     return this.newView(Split3View, Split3Model, "splitter3", "splitter3_" + this.splitter3_id, !0, !0, a, b)
    // },
    newSplitFunc: function(a, b){
        this.splitfunc_id++;
        return this.newView(SplitFuncView, SplitFuncModel, "splitfunc", "splitfunc_" + this.splitfunc_id, !0, !0, a, b);
    },
    // newSwitch: function(a, b){
    //     this.switch_id++;
    //     return this.newView(SwitchView, SwitchModel, "switch","switch_" + this.switch_id, !0, !0, a, b)
    // },
    // newStack: function(a, b){
    //     this.stack_id++;
    //     return this.newView(ImageView, StackModel, "stack", "stack_" + this.stack_id, !0, !0, a, b)
    // },
    newFunc: function(a, b){
        this.func_id++;
        return this.newView(ImageView, FuncModel, "func","func_" + this.func_id, !0, !0, a, b)
    },
    newReverser: function(a, b){
        this.reverser_id++;
        return this.newView(ReverserView, ReverserModel, "reverser", "reverser_" + this.reverser_id, !0, !0, a, b)
    },
    newThermometer: function(a, b){
        this.thermometer_id++;
        return this.newView(ImageView, ThermoModel, "thermometer", "thermometer_" + this.thermometer_id, !0, !0, a, b)
    },
    toggleConnections: function() {
        this.showConn = !this.showConn;
        for (var a = this.views.length - 1; a >= 0; a--) this.views[a].showDots(this.showConn)
    },
    save: function() {
        var a = this.stringify();
        $("#save_dialog").dialog("open");
        $("#save_textarea").text(a).focus().select()
    },
    load: function() {
        $("#load_textarea").text("");
        $("#load_dialog").dialog("open")
    },
    loadtext: function(a){
        try {
            var b = JSON.parse(a)
        } catch (c) {}
        this.seed = b.seed ? b.seed : (new Date).getTime();
        if (b.until) this.until = b.until;
        if (b.udoName) NAME_OF_OBJECT = b.udoName;
        if(b.use_udo !== undefined) USE_UDO = b.use_udo;
        /* clear old list of parameters and load the json one */
        LIST_OF_PARAMETERS = [];
        var seenNames = [];

        try {
            b.udo.length;
        } catch(c){
            alert("Bad JSON: cannot read");
            QueueApp.reset(1);
            return;
        }
        if (b.udo){
            for(var i = 0; b.udo && i < b.udo.length; i++){
                if($.inArray(b.udo[i][0], seenNames) == -1 &&
                    $.inArray(b.udo[i][1].toUpperCase(), LIST_OF_TYPES) > -1){
                    LIST_OF_PARAMETERS.push([b.udo[i][0], b.udo[i][1].toUpperCase()]);
                    seenNames.push(b.udo[i][0]);
                }
            }
        }
        a = this.parseTime();
        //$("#config_sim").button("option", "label", a[0].toFixed(3) + " " + a[1]);
        $("#config_label").text(a[0].toFixed(3) + " " + a[1]);
        /* load objects */
        for (var d = b.objects.length, a = {}, e = d - 1; e >= 0; e--) {
            var f = b.objects[e],
                g = null;
            /* instantiate the object */
            
            switch(f.type){
                case "queue":
                    g = this.newServer();
                    break;
                case "source":
                    g = this.newSource();
                    break;
                case "sink":
                    g = this.newSink();
                    break;
//              case "switch":
//                  g = this.newSwitch();
//                  break;
//              case "stack":
//                  g = this.newStack();
//                  break;
//              case "splitter":
//                  g = this.newSplitter();
//                  break;
                case "func":
                    g = this.newFunc(); 
                    break;
                case "splitfunc":
                    g = this.newSplitFunc();
                    break;
                case "reverser":
                    g = this.newReverser();
                    break;
                case "thermometer":
                    g = this.newThermometer();
                    break;
            }

            if (f.model){
                for (prop in f.model){
                    if(prop == "udoFields"){
                        g.model.loadUDOFields(f.model[prop]);
                    } else {
                        g.model[prop] = f.model[prop];
                    }
                }
            }
            g.moveto(f.x, f.y);
            g.name = f.name;
            g.text && g.text.attr({text: g.name});
            a[f.name] = g
        }
        /* make connections */
        for (e = d - 1; e >= 0; e--)
            if (f = b.objects[e], f.out && (d = a[f.name]))
                if (f.out instanceof Array)
                    for (g = f.out.length - 1; g >= 0; g--) {
                        var i = a[f.out[g]];
                        i && d.connect(i, g)
                } else {
                    (i = a[f.out]) && d.connect(i)
                }
    },
    stringify: function() {
        var a = {
            until: this.until,
            seed: this.seed,
            version: "1.1",
            udo: [],
            use_udo: USE_UDO,
            udoName: NAME_OF_OBJECT,
            objects: []
        };
        for (b = this.views.length - 1; b >= 0; b--){
            var tmpStr = (this.views[b].jsonify());
            a.objects.push(tmpStr);
        }
        for(var i = 0; i < LIST_OF_PARAMETERS.length; i++)
            a.udo.push(LIST_OF_PARAMETERS[i]);
        return JSON.stringify(a)
    },
    saveStatString: function() {
        var res = "RESULTS: \n\n"
        for(var i = 0; i < this.models.length; i++){
            res = res + this.views[i].name + ":\n" + statman.parseStats(this.models[i].stat, 1)
        }
        return res;
    },
    parseTime: function() {
        switch(this.timescale){
            case "hours":
                return [this.until/3600,this.timescale]
                break;
            case "mins":
                return [this.until/60,this.timescale]
                break;
            case "secs":
                return [this.until,this.timescale]
                break;
            default:
                this.timescale = this.until > 3600 ? "hours" : this.until > 60 ? "mins" : "secs"
                return this.parseTime()
        }
        //return this.until > 3600 ? [this.until / 3600, "hours"] : this.until > 60 ? [this.until / 60, "mins"] : [this.until, "secs"]
    },
    showSimProperties: function() {
        //console.log("showSimProperties");
        /* vv parseTime format without changing this.until value.*/
        var a = this.parseTime(),
            b = $("#simulation_dialog");
        b.find("#sim_seed").val(this.seed);
        b.find("#sim_until").val(a[0]);
        b.find("#time_selector").val(a[1]);
        b.show().position({
            of: $("#config_sim"),
            at: "left bottom",
            my: "left top"
        })
    },
    saveSettings: function() {
        //console.log("saveSettings");
        var a = $("#simulation_dialog");
        this.until = +a.find("#sim_until").val() || this.parseTime()[0];
        this.seed =
            1*a.find("#sim_seed").val();
        this.timescale = a.find("#time_selector").val();
        this.timescale === "hours" ? this.until *= 3600 : this.timescale === "mins" && (this.until *= 60);
        a = this.parseTime();
        // $("#config_sim").button("option", "label", a[0].toFixed(3) + " " + a[1])
        $("#config_label").text(a[0].toFixed(3) + " " + a[1]);
    },
    updateSettings: function() {
        var a = $("#simulation_dialog");
        var tempUntil = +a.find("#sim_until").val() || this.parseTime()[0];
        var temptimescale = a.find("#time_selector").val();
        this.timescale === "hours" ? tempUntil *= 3600 : this.timescale === "mins" && (tempUntil *= 60);
        temptimescale === "hours" ? tempUntil /= 3600 : temptimescale === "mins" && (tempUntil /= 60);
        this.timescale = temptimescale
        $("#sim_until").val(tempUntil)
    },
    startSim: function() {
        //console.log("startSim");
        var a, b;
        //console.log("Inside start sim");
        this.sim = new Sim;
        this.random = new Random((new Date).getTime());
        $("#progressbar").toggle();
        $("#sim_play_ops").toggle();
        $("#new_ops").toggle();
        $("#file_ops").toggle();
        $("#sim_ops").toggle();
        $("#about_this_model").accordion("activate", !1);
        a = this.models.length;
        for (b = a - 1; b >= 0; b--) this.models[b].start();
        for (b = a - 1; b >= 0; b--) this.models[b].connect();
        this.playing = !0;
        this.paused = !1;
        this.startedAt = (new Date).getTime();
        this.run()
    },
    IntervalLow: 40,
    Interval: 50,
    IntervalHigh: 60,
    EventsPerInterval: 100,
    IntervalPause: 0,
    run: function() {
        //console.log("run");
        var a = QueueApp,
            b = (new Date).getTime(),
            c = a.sim.simulate(a.until, a.EventsPerInterval),
            b = (new Date).getTime() - b;
        if (b < a.IntervalLow || b > a.IntervalHigh) a.EventsPerInterval = Math.floor(a.EventsPerInterval / b * a.Interval);
        a.progress.progressbar({
            value: a.sim.time() * 100 / a.until
        });
        c ? QueueApp.complete() :
            a.playing ? a.paused ? QueueApp.pauseSim() : setTimeout(a.run, a.IntervalPause) : QueueApp.complete()
    },
    complete: function() {
        $("#progressbar").toggle();
        $("#sim_play_ops").toggle();
        $("#new_ops").toggle();
        $("#file_ops").toggle();
        $("#sim_ops").toggle();
        for (var a = QueueApp.models.length - 1; a >= 0; a--) {
            var b = QueueApp.models[a];
            
            if(b.entity.dataCollector){
                for(i = LIST_OF_PARAMETERS.length - 1; i >= 0; i--){
                    b.entity.dataCollector[LIST_OF_PARAMETERS[i][0]].finalize(this.sim.time());
                }
            }
            b.initStats && b.initStats()
            b.showStats && b.showStats()
        }
        // create graphs
        console.log(this.sim);
        console.log("DEBUG: simulation completed");
        
        //Animation function calls

        if(typeof setSimulationResults === "function" &&  typeof runPathFlowAnimation === "function"){
            setSimulationResults();
            runPathFlowAnimation(); 
        }

    },
    pauseSim: function() {
        for (var a = QueueApp.models.length - 1; a >= 0; a--) {
            var b = QueueApp.models[a];
            b.showStats && b.showStats()
        }
    }
};
Raphael.fn.connection = function(a, b, c, d, aIsReverser, bIsReverser) {

    console.log("DEBUG: connection");
    
    if (a.line && a.from && a.to) c = a, a = c.from, b = c.to;

    // console.log("a: " + a);
    // console.log("b: " + b);
    // console.log("c: " + c);
    // console.log("d: " + d);
    // console.log("aIsReverser: " + aIsReverser);
    // console.log("bIsReverser: " + bIsReverser);
    
    if(aIsReverser && bIsReverser) {
        //console.log("both ends of the connection are reversers");
        var e = b.getBBox(),
            f = a.getBBox(),
            g = e.x + e.width + 1,
            e = e.y + e.height / 2,
            i = f.x - 1,
            f = f.y + f.height / 2,
            h = [3, 6];
        dx = Math.max(Math.abs(g - i) / 2, 10);
        dy = Math.max(Math.abs(e - f) / 2, 10);
    } else if (aIsReverser) {
        //console.log("the connection is from a reverser");
        var e = a.getBBox(),
            f = b.getBBox(),
            g = e.x - 1,
            e = e.y + e.height / 2,
            i = f.x - 1,
            f = f.y + f.height / 2,
            h = [3, 6];
        dx = -Math.max(Math.abs(g - i) / 2, 10);
        dy = Math.max(Math.abs(e - f) / 2, 10);
    } else if (bIsReverser) {
        //console.log("the connection is to a reverser");
        var e = a.getBBox(),
            f = b.getBBox(),
            g = e.x + e.width + 1,
            e = e.y + e.height / 2,
            i = f.x + f.width + 1,
            f = f.y + f.height / 2,
            h = [3, 6];
        dx = -Math.max(Math.abs(g - i) / 2, 10);
        dy = Math.max(Math.abs(e - f) / 2, 10);
    } else {
        //console.log("the connection has no reverser");

        var e = a.getBBox(),
            f = b.getBBox(),
            g = e.x + e.width + 1,
            e = e.y + e.height / 2,
            i = f.x - 1,
            f = f.y + f.height / 2,
            h = [3, 6];
        dx = Math.max(Math.abs(g - i) / 2, 10);
        dy = Math.max(Math.abs(e - f) / 2, 10);
    }

    var j = [g, g, g - dx, g + dx][h[0]].toFixed(3),
        k = [e - dy, e + dy, e, e][h[0]].toFixed(3),
        l = [0, 0, 0, 0, i, i, i - dx, i + dx][h[1]].toFixed(3),
        h = [0, 0, 0, 0, e + dy, e - dy, f, f][h[1]].toFixed(3),
        g = ["M", g.toFixed(3), e.toFixed(3), "C", j, k, l, h, i.toFixed(3), f.toFixed(3)].join(",");
    if (c && c.line) c.bg &&
        c.bg.attr({
            path: g
        }), c.line.attr({
            path: g
        });
    else return c = typeof c == "string" ? c : "#000", {
        bg: d && d.split && this.path(g).attr({
            stroke: d.split("|")[0],
            fill: "none",
            "stroke-width": d.split("|")[1] || 3
        }),
        line: this.path(g).attr({
            stroke: c,
            fill: "none"
        }),
        from: a,
        to: b
    }
};

