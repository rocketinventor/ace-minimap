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
                bindKey: { mac: "Command-I", win: "Ctrl-I" },
                isAvailable: function(){ return true; },
                exec: function() {
                    showing ? hide() : show();
                }
            }, plugin);
            
            menus.addItemByPath("View/Display Minimap", new ui.item({
                command: "minimap"
            }), 400, plugin);
            
            settings.on("read", function(e){
                settings.setDefaults("user/ace-minimap", [
                    ["Theme", "dark"]
                ]);
            });
            
            prefs.add({
                "General" : {
                    position: 10,
                    "Minimap" : {
                        position: 15,
                        "Theme": {
                            type: "dropdown",
                            setting: "user/ace-minimap/@theme",
                            position: 1000,
                            items: [
                                { value: "black", caption: "Dark" },
                                { value: "gray", caption: "Light" }
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
            var youarehere_style = document.querySelector(".youarehere").style;
            var minimap_style = div.style;
            div.style.display = "block";
            div.style.backgroundColor = settings.get("user/ace-minimap/@theme");
            // div.innerHTML = settings.get("user/ace-minimap/@theme");
            
            youarehere_style.width = innerWidth * scaleFactor + "px";
            youarehere_style.height = innerHeight * scaleFactor + "px";
            
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
        });
        plugin.on("unload", function() {
            drawn = false;
            showing = false;
        });
        
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