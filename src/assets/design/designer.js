(function($){
    //https://facturacion.finkok.com/app/idesigner/
    $.fn.designer = function( options, comunicate ) {

        var de = {};

        let target = this;

        const array_propertis_text = [
            'fontFamily',
            'fontSize',
            'textAlign',
            'bold',
            'style',
            'decoration'
        ];

        const array_propertis_color = [
            'color',
            'background'
        ];

        const array_propertis_border = [
            'borderTopStyle',
            'borderTopWidth',
            'borderTopColor',
            'borderRightStyle',
            'borderRightWidth',
            'borderRightColor',
            'borderBottomStyle',
            'borderBottomWidth',
            'borderBottomColor',
            'borderLeftStyle',
            'borderLeftWidth',
            'borderLeftColor',
        ];

        const array_properties_grid = [];

        const array_properties_general = [
            'x',
            'y',
            'width',
            'height'
        ];

        const sizespepper = {
            'Letter': {
                w: 818,
                h: 1059
            },
            'Legal':{
                w: 818,
                h: 1250
            }
        };

        de.setting = {
            DEBUG : true,
            READ_ONLY: false,
            id:null,
            name:null,
            description:null,
            type: null,
            SIZE: 'Letter',
            margin:{
                TOP: 0,
                LEFT: 0,
                BOTTOM: 0,
                RIGHT : 0,
            },
            width: 0,
            height: 0,
            items:[]
        };

        de.comunicate = comunicate || {};
        de.PATH_BASE = 'assets/design/';

        de.currentItem = null;
        de.init = function(options){
            $.extend(de.setting, options);
            //Agregamos la hoja.
            de.addPage();
            de.changeSettings();
            de.activaControllers();
        };

        de.getTemplate = function(){
            return de.setting;
        };

        de.setSetting = function(setting){
            $.extend(de.setting, setting);
            de.changeSettings();
        };

        de.setProperty = function(obj){
            for(var att in obj){
                de.setting[att] = obj[att];
            }
        };

        de.copyPropertiesToArray = function(){
            if(de.currentItem != null){
                for(var i = 0; i < de.setting.items.length; i++){
                    if(de.setting.items[i]._TYPE == de.currentItem._TYPE && de.setting.items[i].field == de.currentItem.field){
                        for(var att in de.currentItem){
                            if(typeof de.currentItem != "function"){
                                de.setting.items[i][att] = de.currentItem[att];
                            }
                        }
                        /*
                        if(de.currentItem.EDITABLE_PROPERTIES.indexOf('de_Text') >= 0){
                            for(var j = 0; j < array_propertis_text.length; j++){
                                de.setting.items[i][array_propertis_text[j]] = de.currentItem[array_propertis_text[j]];
                            }
                        }
                        if(de.currentItem.EDITABLE_PROPERTIES.indexOf('de_Color') >= 0){
                            for(var j = 0; j < array_propertis_color.length; j++){
                                de.setting.items[i][array_propertis_color[j]] = de.currentItem[array_propertis_color[j]];
                            }
                        }
                        if(de.currentItem.EDITABLE_PROPERTIES.indexOf('de_Border') >= 0){
                            for(var j = 0; j < array_propertis_border.length; j++){
                                de.setting.items[i][array_propertis_border[j]] = de.currentItem[array_propertis_border[j]];
                            }
                        }
                        if(de.currentItem.EDITABLE_PROPERTIES.indexOf('de_Grid') >= 0){
                            for(var j = 0; j < array_properties_grid.length; j++){
                                de.setting.items[i][array_properties_grid[j]] = de.currentItem[array_properties_grid[j]];
                            }
                        }
                        //Se reasignamos las coordenadas y el tamaño al div.
                        for(var j = 0; j < array_properties_general.length; j++){
                            de.setting.items[i][array_properties_general[j]] = de.currentItem[array_properties_general[j]];
                        }
                        */
                        break;
                    }
                }
            }
        };

        de.activaControllers = function(){
            $("#de_prop_font_family").off().unbind().on("change", function(){
                if(de.currentItem != null){
                    var borders = de.currentItem._item.find(".de_item_borders");
                    borders.css("fontFamily", $(this).val());
                    de.currentItem.fontFamily = $(this).val();
                    de.copyPropertiesToArray();
                }
            });
            $("#de_prop_text_size").off().unbind().on("change", function(){
                if(de.currentItem != null){
                    var borders = de.currentItem._item.find(".de_item_borders");
                    borders.css("fontSize", $(this).val()+'px');
                    de.currentItem.fontSize = $(this).val();
                    de.copyPropertiesToArray();
                }
            });
            $("input[type='radio'][name='radio-text-align']").off().unbind().on("change", function(){
                if(de.currentItem != null){
                    var borders = de.currentItem._item.find(".de_item_borders");
                    borders.css("textAlign", $(this).val());
                    de.currentItem.textAlign = $(this).val();
                    de.copyPropertiesToArray();
                }
            });
            $("#de_prop_font_bold").off().unbind().on("change", function(){
                if(de.currentItem != null){
                    var value = $(this).prop("checked") ? 'bold':'';
                    var borders = de.currentItem._item.find(".de_item_borders");
                    borders.css("fontWeight", value);
                    de.currentItem.bold = value;
                    de.copyPropertiesToArray();
                }
            });
            $("#de_prop_font_italic").off().unbind().on("change", function(){
                if(de.currentItem != null){
                    var value = $(this).prop("checked") ? 'italic':'';
                    var borders = de.currentItem._item.find(".de_item_borders");
                    borders.css("fontStyle", value);
                    de.currentItem.style = value;
                    de.copyPropertiesToArray();
                }
            });
            $("#de_prop_font_underline").off().unbind().on("change", function(){
                if(de.currentItem != null){
                    var value = $(this).prop("checked") ? 'underline':'';
                    var borders = de.currentItem._item.find(".de_item_borders");
                    borders.css("textDecoration", value);
                    de.currentItem.decoration = value;
                    de.copyPropertiesToArray();
                }
            });
            $("#de_prop_text_color").off().unbind().on("change", function(){
                if(de.currentItem != null){
                    var value = $(this).val();
                    var borders = de.currentItem._item.find(".de_item_borders");
                    borders.css("color", value);
                    de.currentItem.color = value;
                    de.copyPropertiesToArray();
                }
            });
            $("#de_prop_backgroud_color").off().unbind().on("change", function(){
                if(de.currentItem != null){
                    var value = $(this).val();
                    var borders = de.currentItem._item.find(".de_item_borders");
                    borders.css("background", value);
                    de.currentItem.background = value;
                    de.copyPropertiesToArray();
                }
            });

            $(".de_border").off().unbind().on("change", function(e){
                if(de.currentItem != null){
                    var check = $(this).prop("checked");
                    var value = $(this).val();
                    var borderWidth = 'border'+value+'Width';
                    var borderColor = 'border'+value+'Color';
                    var borderStyle = 'border'+value+'Style';
                    var borders = de.currentItem._item.find(".de_item_borders");
                    if(check){
                        borders.css(borderWidth, "1px");
                        borders.css(borderColor, "#000000");
                        borders.css(borderStyle, "solid");
                        de.currentItem[borderWidth] = '1px';
                        de.currentItem[borderColor] = '#000000';
                        de.currentItem[borderStyle] = 'solid';
                    }else{
                        borders.css(borderWidth, "0px");
                        borders.css(borderColor, "#000000");
                        borders.css(borderStyle, "none");
                        de.currentItem[borderWidth] = '0px';
                        de.currentItem[borderColor] = '#000000';
                        de.currentItem[borderStyle] = 'none';
                    }
                    de.copyPropertiesToArray();
                }
            });
        };

        de.addPage= function(){
            var pageHTML = `<div class="dd_document_page" style="max-width:818px;width: 818px;" oncontextmenu="return false;">
                <div id="dd_page_template" oncontextmenu="return false;">
                    <div id="dd_area_editable" oncontextmenu="return false;"></div>
                </div>
            </div>`;
            $(target).empty();
            $(target).append(pageHTML);
        }

        de.changeSettings = function(){
            var setting = de.setting || {};
            setting.SIZE = setting.SIZE || 'letter';

            const width = sizespepper[setting.SIZE].w;
            const height = sizespepper[setting.SIZE].h;
            
            setting.margin = setting.margin || {};
            setting.margin.TOP = setting.margin.TOP || 20;
            setting.margin.BOTTOM = setting.margin.BOTTOM || 20;
        
            setting.margin.LEFT = setting.margin.LEFT || 20;
            setting.margin.RIGHT = setting.margin.RIGHT || 20;
        
            $('#dd_document_page').css({
                width: `${width}px`,
                height: `${height}px`,
            });
            $('#dd_page_template').css({
                width: `${width}px`,
                height: `${height}px`,
            });
            const newWidth = width - (setting.margin.LEFT + setting.margin.RIGHT);
            const newHeight = height - (setting.margin.TOP + setting.margin.BOTTOM);

            de.setting.width = newWidth;
            de.setting.height = newHeight;

            $('#dd_area_editable').css({
                width: newWidth+'px',
                height: newHeight+'px',
                marginTop: `${setting.margin.TOP}px`,
                marginBottom: `${setting.margin.BOTTOM}px`,
                marginLeft: `${setting.margin.LEFT}px`,
                marginRight: `${setting.margin.RIGHT}px`,
                border: '1px dashed #CCC',
            });

            for(var i = 0; i < (de.setting.items || []).length; i++){
                if(de.setting.items[i]._TYPE == "DESGLOSE"){
                    if(de.setting.items[i].field == '$$__desglose__$$' || 
                    de.setting.items[i].field == '$$__ppd_documentos_relacionados__$$' ||
                    de.setting.items[i].field == '$$__cporte_ubicaciones__$$' ||
                    de.setting.items[i].field == '$$__cporte__mercancias__$$' ||
                    de.setting.items[i].field == '$$__cporte_figuras__$$' || 
                    de.setting.items[i].field == '$$__documentos_relacionados__$$'){
                        de.addDesgloseFactura(de.setting.items[i]);
                    }else if(de.setting.items[i].field == '$$__desglose_resumen_factura__$$'){
                        de.addDesgloseResumenFactura(de.setting.items[i]);
                    }
                }else if(de.setting.items[i]._TYPE == "PROPIEDAD"){
                    de.add(de.setting.items[i]);
                }else if(de.setting.items[i]._TYPE == "LABEL"){
                    de._addLabel(de.setting.items[i]);
                }else if(de.setting.items[i]._TYPE == "LINE"){
                    de._addLine(de.setting.items[i]);
                }else if(de.setting.items[i]._TYPE == "RECTANGLE"){
                    de._addLine(de.setting.items[i]);
                }
            }
        };
        
        de.add = function(property){
            switch (property.field){
                case '$$__logo_emisor__$$':
                case '$$__qr_code__$$':
                    de.addImageQRORLOGO(property);
                break;
                case '$$__desglose__$$':
                case '$$__ppd_documentos_relacionados__$$':
                case '$$__cporte_ubicaciones__$$':
                case '$$__cporte__mercancias__$$':
                case '$$__cporte_figuras__$$':
                case '$$__documentos_relacionados__$$':
                    de.addDesgloseFactura(property);
                break;
                case '$$__cporte_ubicaciones__$$':

                break;
                case '$$__desglose_resumen_factura__$$':
                    de.addDesgloseResumenFactura(property);
                break;
                default:
                    de.addProperty(property);
                break;
            }
        };
        
        de._cargarPropiedadesPanel = function(item){
            $("fieldset#de_Text").css("display", "none");
            $("fieldset#de_Color").css("display", "none");
            $("fieldset#de_Border").css("display", "none");
            $("fieldset#de_Grid").css("display", "none");
            var nameMethodPart = '_cargarPropiedades';
            for(var i = 0; i < item.EDITABLE_PROPERTIES.length; i++){
                var functionx = nameMethodPart + item.EDITABLE_PROPERTIES[i];
                try {
                    de[functionx](item);
                } catch (e){}
            }
        };

        de._cargarPropiedadesde_Text = function(item){
            $("fieldset#de_Text").css("display", "block");
            var fontFamily = item.fontFamily || "Arial";
            var fontSize   = item.fontSize || 12;
            var textAlign  = item.textAlign || 'left';
            var bold       = item.bold || '';
            var italic     = item.style || '';
            var underline  = item.decoration || '';

            $("#de_prop_font_family option[value='"+fontFamily+"']").prop("selected", true);
            $("#de_prop_text_size option[value='"+fontSize+"']").prop("selected", true);
            $("input[name='radio-text-align'][value='"+textAlign+"']").prop("checked", true);
            $("#de_prop_font_bold").prop("checked", bold == 'bold' ? true : false);
            $("#de_prop_font_italic").prop("checked", italic=='italic'?true:false);
            $("#de_prop_font_underline").prop("checked", underline == 'underline' ? true : false);
        };
        de._cargarPropiedadesde_Color = function(item){
            $("fieldset#de_Color").css("display", "block");
            var textColor = item.color || '#000000';
            var background= item.background || '#FFFFFF';
            $("#de_prop_text_color").val(textColor);
            $("#de_prop_backgroud_color").val(background);
        };
        de._cargarPropiedadesde_Border = function(item){
            $("fieldset#de_Border").css("display", "block");
            var top = (item.borderTopStyle || 'none') == 'solid' ? true : false;
            var right = (item.borderRightStyle || 'none') == 'solid' ? true : false;
            var bottom = (item.borderBottomStyle || 'none') == 'solid' ? true : false;
            var left = (item.borderLeftStyle || 'none') == 'solid' ? true : false;
            $("#de_prop_border_top").prop("checked", top);
            $("#de_prop_border_right").prop("checked", right);
            $("#de_prop_border_bottom").prop("checked", bottom);
            $("#de_prop_border_left").prop("checked", left);

        };
        de._cargarPropiedadesde_Grid = function(item){
            $("fieldset#de_Grid").css("display", "block");
        };

        de.generateId = function(prefix){
            if(!prefix) prefix = 'item_';

            var count = 0;
            do{
                count++;
            }while($('#'+prefix+count).length);
            return prefix+count;
        };
        
        /**
         * Funciones para manejo de arrastre y tamaño
         */
        de._becomeDraggable = function(self){
            if(de.setting.READ_ONLY) return;
            self._item.draggable({
                containment:'parent',
                cursor:'move',
                opacity: 0.75,
                start:self.focus,
                stop: function (e, ui) {
                    var offset = self._item.position();
                    var top = Math.round(offset.top);
                    var left = Math.round(offset.left);
                    self.x = left;
                    self.y = top;
                    self._item.css({
                        top: top,
                        left: left
                    });
                    if(de.currentItem != null){
                        de.currentItem.x = self.x;
                        de.currentItem.y = self.y;
                        de.copyPropertiesToArray();
                    }
                }
            });
            self._item.data('dd-item-draggable', true);
        };
        de._isDraggable = function (self) {
            return self._item.data('dd-item-draggable');
        };

        de.adjust = function(e) {
            if(de.currentItem != null){
                var borders = de.currentItem._item.find('.de_item_borders');
                var border_width = parseInt(borders.css('borderRightWidth')) + parseInt(borders.css('borderLeftWidth'));
                var border_height = parseInt(borders.css('borderTopWidth')) + parseInt(borders.css('borderBottomWidth'));
                var width = borders.width();
                var height = borders.height();
                if(border_width > 0){
                    width = de.currentItem._item.width() - border_width;
                }
                if(border_height > 0){
                    height = de.currentItem._item.height() - border_height;
                }
                de.currentItem.width = width;
                de.currentItem.height = height;
                //borders.width( width );
                //borders.height( height );
                de.copyPropertiesToArray();
            }
        };

        de._becomeResizable = function(self){
            if( de.setting.READ_ONLY ) return;
            self._item.resizable({
                /*ghost: true,
                aspectRatio: false,*/
                handles: 's,e,se',
                start: self.focus,
                stop:self.adjust
            });
            self._item.data('dd-item-resizable', true);
        };
        de.isResizable = function (self) {
            return self._item.data('dd-item-resizable');
        };
        
        de._becomeRemovable = function(self){
            if(de.setting.READ_ONLY) return;
            $.contextMenu({
                selector: '#'+self._item.attr('id'),
                events: {
                    activated : function(options){
                        $(self._item).trigger("click");
                    },
                },
                items: {
                    delete: {
                        name: 'Eliminar',
                        iconDelete:'context-menu-icon-delete',
                        callback: function(key, opt){
                            setTimeout(function(){
                                if(de.currentItem != null){
                                    for(var i = 0; i < de.setting.items.length; i++){
                                        if(de.currentItem.field == de.setting.items[i].field && de.currentItem._TYPE == de.setting.items[i]._TYPE){
                                            de.setting.items.splice(i, 1);
                                            $('#'+self._item.attr('id')).remove();
                                            de.comunicate.returnProperties(de.currentItem);
                                            de.currentItem = null;
                                            break;
                                        }
                                    }
                                }
                            }, 50);
                        }
                    }
                },
                zIndex:1000,
            });
            self._item.data('dd-item-removable', true);
        };

        de._isRemovable = function (self) {
            return self._item.data('dd-item-removable');
        };

        de._isSelectable = function(self){
            return self._item.data('dd-item-selectable');
        }

        de._becomeSelectable = function(self){
            if(de.setting.READ_ONLY) return;
            self._item.click(self.focus);
            self._item.data('dd-item-selectable', true);
        };

        de.inArray = function(element){
            for(var i = 0; i < (de.setting.items || []).length; i++){
                if(element.field == de.setting.items[i].field){
                    return true;
                }
            }
            return false;
        }

        de.addLabel = function(){
            var s = 'label_' + Math.ceil(Math.random() * 15240545454454445);
            var properties = {
                field: s,
                label: s,
            };
            de._addLabel(properties);
        };

        de.addLine = function() {
            var s = 'line_' + Math.ceil(Math.random() * 15240545454454445) + '_' + Math.ceil(Math.random() * 1575);
            var properties = {
                field: s,
                label: s,
            };
            de._addLine(properties);
        };

        de.addRectangle = function() {
            var s = 'rectangle_' + Math.ceil(Math.random() * 1524054454445) + '_' + Math.ceil(Math.random() * 1575);
            var properties = {
                field: s,
                label: s,
            };
            de._addRectangle(properties);
        };

        de._addLabel = function(property){
            var self = {
                property: JSON.parse(JSON.stringify(property))
            };
            self.id = null;
            self._item;
            self.field = property.field;
            self._TYPE = property._TYPE || 'LABEL';
            self.text = '';
            //Agregamos sus propiedades
            self.fontFamily = property.fontFamily || 'Arial';
            self.fontSize = property.fontSize || 12;
            self.textAlign = property.textAlign || 'left';
            self.bold = property.bold || 'normal';
            self.style = property.style || '';
            self.decoration = property.decoration || 'none';

            self.color = property.color || '#000000';
            self.background = property.background || '#FFFFFF';

            self.borderTopStyle = property.borderTopStyle || 'none';
            self.borderTopWidth = property.borderTopWidth || 0;
            self.borderTopColor = property.borderTopColor || '';
            
            self.borderRightStyle = property.borderRightStyle || 'none';
            self.borderRightWidth = property.borderRightWidth || 0;
            self.borderRightColor = property.borderRightColor || '';

            self.borderBottomStyle = property.borderBottomStyle || 'none';
            self.borderBottomWidth = property.borderBottomWidth || 0;
            self.borderBottomColor = property.borderBottomColor || '';

            self.borderLeftStyle = property.borderLeftStyle || 'none';
            self.borderLeftWidth = property.borderLeftWidth || 0;
            self.borderLeftColor = property.borderLeftColor || '';
            self.label = property.label;

            self.EDITABLE_PROPERTIES = ['de_Text', 'de_Color', 'de_Border'];
            self._becomeDraggable = de._becomeDraggable;
            self._isDraggable = de._isDraggable;

            self._becomeResizable = de._becomeResizable;
            self.isResizable = de.isResizable;
            
            self._becomeSelectable = de._becomeSelectable;
            self._isSelectable = de._isSelectable;
            
            self._becomeRemovable = de._becomeRemovable;
            self._isRemovable = de._isRemovable;

            self.adjust = de.adjust;

            self._create = function(propiedad){
                var prefix = 'label_' + propiedad.field;
                var id = propiedad.id || de.generateId(prefix);
                var item = $('#' + id);
                if(item.length) return item;
                var item = $('<div />');
                item.attr('id', id);
                item.addClass('de_item');

                var text = propiedad.label || 'LABEL';
                var labelx = propiedad.label || 'Label';

                var label = $('<div />').addClass('de_item_label').text(labelx);
                label.attr('unselectable', 'on').appendTo(item);
                
                var borders = $('<div />').addClass('de_item_borders').text(text);
                borders.css({
                    fontFamily: self.fontFamily,
                    fontSize: self.fontSize+'px',
                    textAlign: self.textAlign,
                    fontWeight: self.bold,
                    fontStyle: self.style,
                    textDecoration: self.decoration,
                    color: self.color,
                    backgroundColor: self.background,

                    borderTopStyle: self.borderTopStyle,
                    borderTopWidth: self.borderTopWidth+'px',
                    borderTopColor: self.borderTopColor,
                    
                    borderRightStyle: self.borderRightStyle,
                    borderRightWidth: self.borderRightWidth+'px',
                    borderRightColor: self.borderRightColor,

                    borderBottomStyle: self.borderBottomStyle,
                    borderBottomWidth: self.borderBottomWidth+'px',
                    borderBottomColor: self.borderBottomColor,

                    borderLeftStyle: self.borderLeftStyle,
                    borderLeftWidth: self.borderLeftWidth+'px',
                    borderLeftColor: self.borderLeftColor,
                });
                borders.attr('unselectable', 'on').appendTo(item);

                self.width = propiedad.width || undefined;
                self.height = propiedad.height || undefined;
                if(typeof propiedad.width == "undefined" || typeof propiedad.height == "undefined"){
                    var length = String(text || '').trim().length == 0 ? 1 : String(text || '').trim().length;
                    var width = (length * 10);
                    if(width >= de.setting.width){
                        width = de.setting.width - 20;
                    }
                    var height = 20;
                    
                    self.width = width;
                    self.height = height;
                }

                self.x = propiedad.x || Math.ceil(Math.random()*500 );
                self.y = propiedad.y || Math.ceil(Math.random()*200 );

                item.css({
                    left: self.x,
                    top: self.y,
                    width: self.width + 'px',
                    height: self.height + 'px',
                    'max-width':(de.setting.width) + 'px'
                });

                item.appendTo('#dd_area_editable');
                item.css('zIndex', $('.de_item').length);
                return item;
            }

            self.edit = function ( text ) {
                var content = self._item.children('.de_item_borders');
                if (text){
                    content.text( text );
                    self.label = text;
                    self.example = text;
                }
            };

            self.focus = function(e){
                if( de.setting.READ_ONLY ) return;
                if (self._item.hasClass('active')) return;
                self._item.addClass('active').siblings().removeClass('active');
                de.currentItem = self;
                de._cargarPropiedadesPanel(self);
            };

            self.construct = function(property){
                self._item = self._create(property);
                self.id = self._item.attr('id');

                self._item.dblclick(function(){
                    var content = self._item.children('.de_item_borders');
                    var text = window.prompt('Agrege su texto', content.text() || '');
                    self.edit(text);
                });

                if(!self._isDraggable(self)){
                    self._becomeDraggable(self);
                }
                if (!self.isResizable(self)) {
                    self._becomeResizable(self);
                }
                if (!self._isSelectable(self)) {
                    self._becomeSelectable(self);
                }
                if (!self._isRemovable(self)){
                    self._becomeRemovable(self);
                }
            };

            self.construct(property);
            $(self._item).trigger("click");
            if(!de.inArray(property)){
                de.setting.items.push(self);
            }
        };

        de._addRectangle = function(property){
            var self = property || {};
            self.id = null;
            self._item;
            self.field = property.field;
            self._TYPE = property._TYPE || 'RECTANGLE';
            self.background = property.background || '#000000';
            self.EDITABLE_PROPERTIES = ['de_Color', 'de_Border'];

            self._becomeDraggable = de._becomeDraggable;
            self._isDraggable = de._isDraggable;
            
            self._becomeResizable = de._becomeResizable;
            self.isResizable = de.isResizable;
            
            self._becomeSelectable = de._becomeSelectable;
            self._isSelectable = de._isSelectable;
            
            self._becomeRemovable = de._becomeRemovable;
            self._isRemovable = de._isRemovable;

            self.adjust = de.adjust;

            self._create = function(propiedad){
                var prefix = 'rectangle_' + propiedad.field;
                var id = propiedad.id || de.generateId(prefix);
                var item = $('#' + id);
                if(item.length) return item;
                var item = $('<div />');
                item.attr('id', id);
                item.addClass('de_item');

                var label = $('<div />').addClass('de_item_label').text('Rectangle');
                label.attr('unselectable', 'on').appendTo(item);

                var borders = $('<div />').addClass('de_item_borders');
                borders.css({
                    backgroundColor: self.background,
                });
                borders.attr('unselectable', 'on').appendTo(item);
                self.width = propiedad.width || 150;
                self.height = propiedad.height || 100;
                self.x = propiedad.x || Math.ceil(Math.random()*500 );
                self.y = propiedad.y || Math.ceil(Math.random()*200 );

                item.css({
                    top: self.y,
                    left: self.x,
                    width: self.width + 'px',
                    height: self.height + 'px',
                    backgroundColor: 'transparent',
                    'max-width': de.setting.width + 'px'
                });
                item.appendTo('#dd_area_editable');
                item.css('zIndex', 0);
                return item;
            }
            
            
            self.focus = function(e){
                if( de.setting.READ_ONLY ) return;
                if (self._item.hasClass('active')) return;
                self._item.addClass('active').siblings().removeClass('active');
                de.currentItem = self;
                de._cargarPropiedadesPanel(self);
            };

            self.construct = function(property){
                self._item = self._create(property);
                self.id = self._item.attr('id');

                self._item.dblclick(function(){});

                if(!self._isDraggable(self)){
                    self._becomeDraggable(self);
                }
                if (!self.isResizable(self)) {
                    self._becomeResizable(self);
                }
                if (!self._isSelectable(self)) {
                    self._becomeSelectable(self);
                }
                if (!self._isRemovable(self)){
                    self._becomeRemovable(self);
                }
            };
            self.construct(property);
            $(self._item).trigger("click");
            if(!de.inArray(property)){
                de.setting.items.push(self);
            }
        };

        de._addLine = function(property){
            var self = property || {};
            self.id = null;
            self._item;
            self.field = property.field;
            self._TYPE = property._TYPE || 'LINE';
            self.text = '';
            self.background = property.background || '#000000';
            self.EDITABLE_PROPERTIES = ['de_Color'];

            self._becomeDraggable = de._becomeDraggable;
            self._isDraggable = de._isDraggable;
            
            self._becomeResizable = de._becomeResizable;
            self.isResizable = de.isResizable;
            
            self._becomeSelectable = de._becomeSelectable;
            self._isSelectable = de._isSelectable;
            
            self._becomeRemovable = de._becomeRemovable;
            self._isRemovable = de._isRemovable;

            self.adjust = de.adjust;

            self._create = function(propiedad){
                var prefix = 'label_' + propiedad.field;
                var id = propiedad.id || de.generateId(prefix);
                var item = $('#' + id);
                if(item.length) return item;
                var item = $('<div />');
                item.attr('id', id);
                item.addClass('de_item');

                var label = $('<div />').addClass('de_item_label').text('Linea');
                label.attr('unselectable', 'on').appendTo(item);

                var borders = $('<div />').addClass('de_item_borders');
                borders.css({
                    backgroundColor: self.background,
                });
                borders.attr('unselectable', 'on').appendTo(item);
                self.width = propiedad.width || 150;
                self.height = propiedad.height || 4;
                self.x = propiedad.x || Math.ceil(Math.random()*500 );
                self.y = propiedad.y || Math.ceil(Math.random()*200 );

                item.css({
                    top: self.y,
                    left: self.x,
                    width: self.width + 'px',
                    height: self.height + 'px',
                    backgroundColor: 'transparent',
                    'max-width': de.setting.width + 'px'
                });
                item.appendTo('#dd_area_editable');
                item.css('zIndex', $('.de_item').length);
                return item;
            }
            
            
            self.focus = function(e){
                if( de.setting.READ_ONLY ) return;
                if (self._item.hasClass('active')) return;
                self._item.addClass('active').siblings().removeClass('active');
                de.currentItem = self;
                de._cargarPropiedadesPanel(self);
            };

            self.construct = function(property){
                self._item = self._create(property);
                self.id = self._item.attr('id');

                self._item.dblclick(function(){});

                if(!self._isDraggable(self)){
                    self._becomeDraggable(self);
                }
                if (!self.isResizable(self)) {
                    self._becomeResizable(self);
                }
                if (!self._isSelectable(self)) {
                    self._becomeSelectable(self);
                }
                if (!self._isRemovable(self)){
                    self._becomeRemovable(self);
                }
            };
            self.construct(property);
            $(self._item).trigger("click");
            if(!de.inArray(property)){
                de.setting.items.push(self);
            }
        };

        de.addProperty = function(property){
            var self = {
                property: JSON.parse(JSON.stringify(property))
            };
            self.id = null;

            self._item;
            self.field = property.field;
            self._TYPE = property._TYPE || 'PROPIEDAD';

            //Agregamos sus propiedades
            self.fontFamily = property.fontFamily || 'Arial';
            self.fontSize = property.fontSize || 12;
            self.textAlign = property.textAlign || 'left';
            self.bold = property.bold || 'normal';
            self.style = property.style || '';

            self.decoration = property.decoration || 'none';
            self.color = property.color || '#000000';
            self.background = property.background || '#FFFFFF';

            self.borderTopStyle = property.borderTopStyle || 'none';
            self.borderTopWidth = property.borderTopWidth || 0;
            self.borderTopColor = property.borderTopColor || '';
            
            self.borderRightStyle = property.borderRightStyle || 'none';
            self.borderRightWidth = property.borderRightWidth || 0;
            self.borderRightColor = property.borderRightColor || '';

            self.borderBottomStyle = property.borderBottomStyle || 'none';
            self.borderBottomWidth = property.borderBottomWidth || 0;
            self.borderBottomColor = property.borderBottomColor || '';

            self.borderLeftStyle = property.borderLeftStyle || 'none';
            self.borderLeftWidth = property.borderLeftWidth || 0;
            self.borderLeftColor = property.borderLeftColor || '';

            self.EDITABLE_PROPERTIES = ['de_Text', 'de_Color', 'de_Border'];

            self._create = function(propiedad){
                var prefix = 'property_' + property.field.replace(/\$/gi, '');
                var id = propiedad.id || de.generateId(prefix);
                var item = $('#' + id);
                if(item.length) return item;
                var item = $('<div />');
                item.attr('id', id);
                item.addClass('de_item');

                var text = (propiedad.example || (propiedad.label || 'PROPIEDAD'));
                var labelx = propiedad.label || propiedad.field;

                var label = $('<div />').addClass('de_item_label').text(labelx);
                label.attr('unselectable', 'on').appendTo(item);
                var borders = $('<div />').addClass('de_item_borders');
                if(propiedad.field == "sello_cfd" || propiedad.field == "sello_sat" || propiedad.field == "cadena_original_sat"){
                    var textarea = $('<textarea />');
                    textarea.css({
                        width: "100%",
                        height: "100%",
                        border: "none",
                        resize: "none",
                        "overflow-y": "hidden"
                    });
                    textarea.text(text);
                    textarea.appendTo(borders);
                }else{
                    borders.text(text);
                }
                borders.css({
                    fontFamily: self.fontFamily,
                    fontSize: self.fontSize+'px',
                    textAlign: self.textAlign,
                    fontWeight: self.bold,
                    fontStyle: self.style,
                    textDecoration: self.decoration,
                    color: self.color,
                    backgroundColor: self.background,

                    borderTopStyle: self.borderTopStyle,
                    borderTopWidth: self.borderTopWidth+'px',
                    borderTopColor: self.borderTopColor,
                    
                    borderRightStyle: self.borderRightStyle,
                    borderRightWidth: self.borderRightWidth+'px',
                    borderRightColor: self.borderRightColor,

                    borderBottomStyle: self.borderBottomStyle,
                    borderBottomWidth: self.borderBottomWidth+'px',
                    borderBottomColor: self.borderBottomColor,

                    borderLeftStyle: self.borderLeftStyle,
                    borderLeftWidth: self.borderLeftWidth+'px',
                    borderLeftColor: self.borderLeftColor,
                });
                borders.attr('unselectable', 'on').appendTo(item);

                self.width = propiedad.width || undefined;
                self.height = propiedad.height || undefined;
                if(typeof propiedad.width == "undefined" || typeof propiedad.height == "undefined"){
                    var length = String(text || '').trim().length == 0 ? 1 : String(text || '').trim().length;
                    var width = (length * 10);
                    if(width >= de.setting.width){
                        width = de.setting.width - 20;
                    }
                    var height = 20;
                    
                    self.width = width;
                    self.height = height;
                }

                self.x = propiedad.x || Math.ceil(Math.random()*500 );
                self.y = propiedad.y || Math.ceil(Math.random()*200 );

                item.css({
                    left: self.x,
                    top: self.y,
                    width: self.width + 'px',
                    height: self.height + 'px',
                    'max-width':(de.setting.width) + 'px'
                });
                item.appendTo('#dd_area_editable');
                item.css('zIndex', $('.de_item').length);
                return item;
            }
            self._becomeDraggable = de._becomeDraggable;
            self._isDraggable = de._isDraggable;

            self._becomeResizable = de._becomeResizable;
            self.isResizable = de.isResizable;
            
            self._becomeSelectable = de._becomeSelectable;
            self._isSelectable = de._isSelectable;
            
            self._becomeRemovable = de._becomeRemovable;
            self._isRemovable = de._isRemovable;
            self.adjust = de.adjust;
            
            self.focus = function(e){
                if( de.setting.READ_ONLY ) return;
                if (self._item.hasClass('active')) return;
                self._item.addClass('active').siblings().removeClass('active');
                de.currentItem = self;
                de._cargarPropiedadesPanel(self);
            };

            self.construct = function(propiedad){
                self._item = self._create(propiedad);
                self.id = self._item.attr('id');

                if(!self._isDraggable(self)){
                    self._becomeDraggable(self);
                }
                if (!self.isResizable(self)) {
                    self._becomeResizable(self);
                }
                if (!self._isSelectable(self)) {
                    self._becomeSelectable(self);
                }
                if (!self._isRemovable(self)){
                    self._becomeRemovable(self);
                }
            };
            self.construct(property);
            $(self._item).trigger("click");
            if(!de.inArray(property)){
                de.setting.items.push(self);
            }
        };

        de.addImageQRORLOGO = function(property){
            var self = {
                property: JSON.parse(JSON.stringify(property))
            };
            self.id = property.id || null;
            self._item;
            self.field = property.field;
            self._TYPE = property._TYPE || 'PROPIEDAD';
            //Agregamos sus propiedades
            self.borderTopStyle = property.borderTopStyle || 'none';
            self.borderTopWidth = property.borderTopWidth || 0;
            self.borderTopColor = property.borderTopColor || '';
            
            self.borderRightStyle = property.borderRightStyle || 'none';
            self.borderRightWidth = property.borderRightWidth || 0;
            self.borderRightColor = property.borderRightColor || '';

            self.borderBottomStyle = property.borderBottomStyle || 'none';
            self.borderBottomWidth = property.borderBottomWidth || 0;
            self.borderBottomColor = property.borderBottomColor || '';

            self.borderLeftStyle = property.borderLeftStyle || 'none';
            self.borderLeftWidth = property.borderLeftWidth || 0;
            self.borderLeftColor = property.borderLeftColor || '';

            self.height = property.height || 0;
            self.width = property.width || 0;

            self.label = property.label;
            self.example = (property.example || (property.label || property.field));

            self.EDITABLE_PROPERTIES = ['de_Border'];
            self._becomeDraggable = de._becomeDraggable;
            self._isDraggable = de._isDraggable;
            
            self._becomeResizable = de._becomeResizable;
            self.isResizable = de.isResizable;
            
            self._becomeSelectable = de._becomeSelectable;
            self._isSelectable = de._isSelectable;
            
            self._becomeRemovable = de._becomeRemovable;
            self._isRemovable = de._isRemovable;
            
            self.adjust = de.adjust;

            self._create = function(property){
                var prefix = 'image' + property.field.replace(/\$/gi, '');
                var id = self.id || de.generateId(prefix);
                var item = $('#' + id);
                if(item.length) return item;
                var item = $('<div />');
                item.attr('id', id);
                item.addClass('de_item');
                var labelx = property.label || property.field;
                var label = $('<div />').addClass('de_item_label').text(labelx);
                label.attr('unselectable', 'on').appendTo(item);
                var borders = $('<div />').addClass('de_item_borders');
                var width = property.width || 170;
                var height = property.height || 170;

                if(property.field == '$$__logo_emisor__$$'){
                    width = property.width || 200;
                    height = property.height || 150;
                    borders.append('<img style="width:100%;height:100%;" src="'+de.PATH_BASE+'image/company-logo.jpg" alt="LOGO EMPRESA">');
                }else if(property.field == '$$__qr_code__$$'){
                    borders.append('<img style="width:100%;height:100%;" src="'+de.PATH_BASE+'image/qrcode.gif" alt="QR">');
                }

                self.height = height;
                self.width = width;

                borders.css({
                    borderTopStyle: self.borderTopStyle,
                    borderTopWidth: self.borderTopWidth+'px',
                    borderTopColor: self.borderTopColor,

                    borderRightStyle: self.borderRightStyle,
                    borderRightWidth: self.borderRightWidth+'px',
                    borderRightColor: self.borderRightColor,

                    borderBottomStyle: self.borderBottomStyle,
                    borderBottomWidth: self.borderBottomWidth+'px',
                    borderBottomColor: self.borderBottomColor,

                    borderLeftStyle: self.borderLeftStyle,
                    borderLeftWidth: self.borderLeftWidth+'px',
                    borderLeftColor: self.borderLeftColor,
                });
                borders.attr('unselectable', 'on').appendTo(item);
                self.x = Math.ceil( property.x || Math.random()*500 );
                self.y = Math.ceil( property.y || Math.random()*200 );
                item.css({
                    left: self.x,
                    top: self.y,
                    width: width + 'px',
                    height: height + 'px',
                    'max-width':(de.setting.width - 5) + 'px'
                });
                item.appendTo('#dd_area_editable');
                item.css('zIndex', $('.de_item').length);
                return item;
            }

            self.focus = function(e){
                if( de.setting.READ_ONLY ) return;
                if (self._item.hasClass('active')) return;
                self._item.addClass('active').siblings().removeClass('active');
                de.currentItem = self;
                de._cargarPropiedadesPanel(self);
            };

            self.construct = function(property){
                self._item = self._create(property);
                
                self.id = self._item.attr('id');
                if(!self._isDraggable(self)){
                    self._becomeDraggable(self);
                }
                if (!self.isResizable(self)) {
                    self._becomeResizable(self);
                }
                if (!self._isSelectable(self)) {
                    self._becomeSelectable(self);
                }
                if (!self._isRemovable(self)){
                    self._becomeRemovable(self);
                }
            };            
            self.construct(property);
            $(self._item).trigger("click");

            if(!de.inArray(property)){
                de.setting.items.push(self);
            }
        };

        de.addDesgloseResumenFactura = function(property) {
            var self = {
                property: JSON.parse(JSON.stringify(property))
            };
            self.id = null;
            self._item;
            self.field = property.field;
            self._TYPE = property._TYPE || 'DESGLOSE';
            self.EDITABLE_PROPERTIES = ['de_Grid'];
            self.width = 0;
            self.height = 0;
            self.x = 0;
            self.y = 0;

            self.theads = property.theads || [
                {label: 'Descripcion', field: 'descripcion', width: 70, apply: true},
                {label: 'Importe', field: 'importe', width: 25, apply: true},
            ];
            self._create = function(propiedad){
                var prefix = 'implocal1';
                var id = de.generateId(prefix);
                var item = $('#' + id);
                if(item.length) return item;
                var item = $('<div />');
                item.attr('id', id);
                item.addClass('de_item');

                var text = propiedad.label || 'LABEL';
                var labelx = propiedad.label || 'Label';
                var label = $('<div />').addClass('de_item_label').text(labelx);
                label.attr('unselectable', 'on').appendTo(item);
                var tableDesgloseResumenFactura = $('<table />').css({
                    width:'100%',
                    height: 'auto',
                });
                var example = JSON.parse(propiedad.example || '[]');
                var tbody = $('<tbody />');
                for(var i = 0; i < example.length; i++){
                    var tr = $('<tr />');
                    for(var j = 0; j < self.theads.length; j++){
                        if(self.theads[j].apply == true || self.theads[j].apply == "true"){
                            var td = $('<td />');
                            if(self.theads[j].field == "descripcion"){
                                td.css({
                                    textAlign: "right",
                                    fontWeight: "bold"
                                });
                            }else if(self.theads[j].field == "importe"){
                                td.css({
                                    textAlign: "right"
                                });
                                if(!isNaN(Number(example[i][self.theads[j].field]))){
                                    example[i][self.theads[j].field] = Number(example[i][self.theads[j].field]).toFixed(2);
                                }else{
                                    example[i][self.theads[j].field] = "--";
                                }
                            }
                            td.text(example[i][self.theads[j].field]);
                            td.appendTo(tr);
                        }
                    }
                    tr.css({"borderBotton": "1px solid #000000"});
                    tr.appendTo(tbody);
                }
                tbody.appendTo(tableDesgloseResumenFactura);
                var borders = $('<div />', {
                    style: "font-size:12px",
                }).addClass('de_item_borders');
                borders.attr('unselectable', 'on');
                tableDesgloseResumenFactura.appendTo(borders);
                borders.appendTo(item);

                self.width = propiedad.width || undefined;
                self.height = propiedad.height || undefined;

                if(typeof propiedad.width == "undefined" || typeof propiedad.height == "undefined"){
                    self.width  = propiedad.width || de.setting.width/3;
                    self.height = propiedad.height || 120;
                }
                self.x = propiedad.x || 120;
                self.y = propiedad.y || 450;

                item.css({
                    left: self.x,
                    top: self.y,
                    width: self.width + 'px',
                    height: self.height + 'px',
                    maxWidth:(de.setting.width) + 'px'
                });
                item.appendTo('#dd_area_editable');
                item.css('zIndex', $('.de_item').length);
                return item;
            }
            self._becomeDraggable = de._becomeDraggable;
            self._isDraggable = de._isDraggable;

            self._becomeResizable = de._becomeResizable;
            self.isResizable = de.isResizable;
            
            self._becomeSelectable = de._becomeSelectable;
            self._isSelectable = de._isSelectable;
            
            self._becomeRemovable = de._becomeRemovable;
            self._isRemovable = de._isRemovable;

            self.adjust = de.adjust;

            self.focus = function(e){
                if( de.setting.READ_ONLY ) return;
                if (self._item.hasClass('active')) return;
                self._item.addClass('active').siblings().removeClass('active');
                de.currentItem = self;
                de._cargarPropiedadesPanel(self);
            };

            self.construct = function(property){
                self._item = self._create(property);
                self.id = self._item.attr('id');

                self._item.dblclick(function(){});

                if(!self._isDraggable(self)){
                    self._becomeDraggable(self);
                }
                if (!self.isResizable(self)) {
                    self._becomeResizable(self);
                }
                if (!self._isSelectable(self)) {
                    self._becomeSelectable(self);
                }
                if (!self._isRemovable(self)){
                    self._becomeRemovable(self);
                }
            };
            self.construct(property);
            $(self._item).trigger("click");
            if(!de.inArray(property)){
                de.setting.items.push(self);
            }
        };

        de.addDesgloseFactura = function(property){
            var self = {
                property: JSON.parse(JSON.stringify(property))
            };
            self.id = null;
            self._item;
            self.field = property.field;
            self._TYPE = property._TYPE || 'DESGLOSE';
            self.EDITABLE_PROPERTIES = ['de_Grid'];
            self.width = 0;
            self.height = 0;
            self.x = 0;
            self.y = 0;
            
            self.theads = property.theads || property.setting;

            self._create = function(propiedad){
                var prefix = 'conceptos_1';
                var id = de.generateId(prefix);
                var item = $('#' + id);
                if(item.length) return item;
                var item = $('<div />');
                item.attr('id', id);
                item.addClass('de_item');

                var text = propiedad.label || 'LABEL';
                var labelx = propiedad.label || 'Label';

                var label = $('<div />').addClass('de_item_label').text(labelx);
                label.attr('unselectable', 'on').appendTo(item);
                
                var tableConceptos = $('<table />').css({
                    width:'100%',
                    height: 'auto',
                });
                var tHead = $('<thead />');
                var tr = $('<tr />');
                for(var i = 0; i < self.theads.length; i++){
                    if(self.theads[i].apply == true || self.theads[i].apply == "true"){
                        var th = $('<th />').text(self.theads[i].label);
                        th.css({
                            width: self.theads[i].width + '%',
                            height: 'auto',
                            backgroundColor: (self.theads[i].background || "#000"),
                            color: (self.theads[i].color || "#FFF"),
                            border:'1px solid #FFF'
                        });
                        th.appendTo(tr);
                    }
                }
                tr.appendTo(tHead);
                tHead.appendTo(tableConceptos);
                var example = JSON.parse(propiedad.example || '[]');
                var tbody = $('<tbody />');
                for(var i = 0; i < example.length; i++){
                    var tr = $('<tr />');
                    for(var j = 0; j < self.theads.length; j++){
                        if(self.theads[j].apply == true || self.theads[j].apply == "true"){
                            var td = $('<td />').text(example[i][self.theads[j].field]);
                            td.appendTo(tr);
                        }
                    }
                    tr.appendTo(tbody);
                }
                tbody.appendTo(tableConceptos);
                var borders = $('<div />', {
                    style: "font-size:12px",
                }).addClass('de_item_borders');
                borders.attr('unselectable', 'on');
                tableConceptos.appendTo(borders);
                borders.appendTo(item);


                self.width = propiedad.width || undefined;
                self.height = propiedad.height || undefined;

                if(typeof propiedad.width == "undefined" || typeof propiedad.height == "undefined"){
                    self.width  = propiedad.width || de.setting.width;
                    self.height = propiedad.height || 300;
                }
                self.x = propiedad.x || 21;
                self.y = propiedad.y || 300;

                item.css({
                    left: self.x,
                    top: self.y,
                    width: self.width + 'px',
                    height: self.height + 'px',
                    maxWidth:(de.setting.width) + 'px'
                });
                item.appendTo('#dd_area_editable');
                item.css('zIndex', $('.de_item').length);
                return item;
            }
            self._becomeDraggable = de._becomeDraggable;
            self._isDraggable = de._isDraggable;

            self._becomeResizable = de._becomeResizable;
            self.isResizable = de.isResizable;
            
            self._becomeSelectable = de._becomeSelectable;
            self._isSelectable = de._isSelectable;
            
            self._becomeRemovable = de._becomeRemovable;
            self._isRemovable = de._isRemovable;

            self.adjust = de.adjust;
            
            self.focus = function(e){
                if( de.setting.READ_ONLY ) return;
                if (self._item.hasClass('active')) return;
                self._item.addClass('active').siblings().removeClass('active');
                de.currentItem = self;
                de._cargarPropiedadesPanel(self);
            };

            self.construct = function(property){
                self._item = self._create(property);
                self.id = self._item.attr('id');

                self._item.dblclick(function(){});

                if(!self._isDraggable(self)){
                    self._becomeDraggable(self);
                }
                if (!self.isResizable(self)) {
                    self._becomeResizable(self);
                }
                if (!self._isSelectable(self)) {
                    self._becomeSelectable(self);
                }
                if (!self._isRemovable(self)){
                    self._becomeRemovable(self);
                }
            };
            self.construct(property);
            $(self._item).trigger("click");
            if(!de.inArray(property)){
                de.setting.items.push(self);
            }
        };
        de.init(options);
        return de;
    };
}(jQuery));