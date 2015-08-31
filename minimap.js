define(function(require, exports, module) {
    main.consumes = [
        "Plugin", "ui", "commands", "menus", "preferences", "settings"
    ];
    main.provides = ["minimap"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var ui = imports.ui;
        var menus = imports.menus;
        var commands = imports.commands;
        var settings = imports.settings;
        var prefs = imports.preferences;
        
        /***** Initialization *****/
        
        var plugin = new Plugin("Ajax.org", main.consumes);
        var emit = plugin.getEmitter();
        
        var showing;
        function load() {
            commands.addCommand({
                name: "minimap",
                bindKey: { mac: "Command-M", win: "Ctrl-M" },
                isAvailable: function(){ return true; },
                exec: function() {
                    showing ? hide() : show();
                }
            }, plugin);
            
            menus.addItemByPath("View/Minimap", new ui.item({
                command: "minimap"
            }), 400, plugin);
            
            settings.on("read", function(e){
                settings.setDefaults("user/ace-minimap", [
                    ["Theme", "ace_editor"],
                    // ["Opacity", ".70"],
                    // ["Autostart", "1"]
                ]);
            });
            
            prefs.add({
                "General" : {
                    position: 10,
                    "Minimap" : {
                        position: 15,
                        // "Opacity": {
                        //     type: "dropdown",
                        //     setting: "user/my-plugin/@opacity",
                        //     width: "75",
                        //     position: 2000,
                        //     items: [
                        //         { value: "1.0", caption: "100%" },
                        //         { value: "0.9", caption: "90%" },
                        //         { value: "0.8", caption: "80%" },
                        //         { value: "0.7", caption: "70%" },
                        //         { value: "0.6", caption: "60%" },
                        //         { value: "0.5", caption: "50%" },
                        //         { value: "0.4", caption: "40%" },
                        //         { value: "0.3", caption: "30%" },
                        //         { value: "0.2", caption: "20%" },
                        //         { value: "0.15", caption: "15%" }
                        //     ]
                        // },
                        // "Autostart": {
                        //     type: "checkbox",
                        //     setting: "user/my-plugin/@autostart",
                        //     position: 10000
                        // },
                        "Background Color": {
                            type: "dropdown",
                            setting: "user/ace-minimap/@theme",
                            position: 1000,
                            items: [
                                { value: "ace_editor", caption: "Automatic" },
                                { value: "black", caption: "Dark" },
                                { value: "gray", caption: "Light" },
                                { value: "rgba(0, 0, 0, 0)", caption: "None" }
                            ]
                        }
                    }
                }
            }, plugin);
        }
        
        var drawn = false;
        function draw() {
            if (drawn) return;
            drawn = true;
            
            // Insert HTML
            var markup = require("text!./plugin.html");
            ui.insertHtml(document.body, markup, plugin);
            
            // Insert CSS
            ui.insertCss(require("text!./style.css"), options.staticPrefix, plugin);
        
            emit("draw");
        }
        
        /***** Methods *****/
        
        function show() {
            draw();
            
            var div = document.querySelector(".minimap");
            div.style.display = "block";
            // var doc = tab.document;
            // var value = doc.value;
            // div.value = value;
            if (settings.get("user/ace-minimap/@theme") == "ace_editor") {
                var elem1 = document.getElementsByClassName("ace_editor")[0];
                var color = window.getComputedStyle(elem1, null).backgroundColor;
                div.style.backgroundColor = color;
            } else {
                div.style.backgroundColor = settings.get("user/ace-minimap/@theme");
            }
            
            // var opacity = settings.get("user/ace-minimap/@opacity");
            // div.style.opacity = opacity;
            // div.setAttribute("style","opacity:" + opacity + ";)");
            // div.setAttribute("style"," -moz-opacity:" + opacity + ";)");
            // div.setAttribute("style","filter:alpha(opacity=" + opacity * 10 + ")");
            // div.setAttribute("style","opacity:0.5; -moz-opacity:0.5; filter:alpha(opacity=50)");
            // div.innerHTML = settings.get("user/ace-minimap/@theme");
            
            emit("show");
            showing = true;
        }
        
        function hide() {
            if (!drawn) return;
            
            document.querySelector(".minimap").style.display = "none";
            
            emit("hide");
            showing = false;
        }
        
        /***** Lifecycle *****/
        
        plugin.on("load", function() {
            load();
                // if (settings.get("user/ace-minimap/@autostart") == 1) 
                    show();
        });
        
        plugin.on("unload", function() {
            drawn = false;
            showing = false;
        });
        
        settings.on("user/ace-minimap/@theme", function(value) {
            console.log("Value changed to:", value);
            show();
        }, plugin);
        
        /***** Register and define API *****/
        
        /**
         * This is an example of an implementation of a plugin.
         * @singleton
         */
        plugin.freezePublicAPI({
            /**
             * @property showing whether this plugin is being shown
             */
            get showing(){ return showing; },
            
            _events: [
                /**
                 * @event show The plugin is shown
                 */
                "show",
                
                /**
                 * @event hide The plugin is hidden
                 */
                "hide"
            ],
            
            /**
             * Show the plugin
             */
            show: show,
            
            /**
             * Hide the plugin
             */
            hide: hide,
        });
        
        register(null, {
            "minimap": plugin
        });
    }
});