// typewriter
(function($, w, d, undefined) {

    function typewriter() {

        // Globals
        let self = this, speed;

        function init(element, options) {
            // Set Globals
            let str ='';
            let indice = 0;
            let reverse = 0;
            let keepGoing = 0;

            self.options = $.extend( {}, $.fn.typewriter.options, options );
            $currentElement = $(element);
            elementStr = $currentElement.text().replace(/\s+/g, ' ');
            dataSpeed  = $currentElement.data("speed") || self.options.speed;
            $currentElement.empty();

            const myString = [
                elementStr,
                "",
                ""
            ];
            const fallBack = [
                11,
                1
            ];
            const stop = 2;

            let showText = setInterval(
                function(){
                    if(reverse === keepGoing) { // forward
                        if (indice++ < myString[keepGoing].length) {
                            let stringEle = myString[keepGoing];
                            $currentElement.append(stringEle[indice - 1]);
                        }else{
                            if(keepGoing === 2){
                                clearInterval(showText);
                            }
                            keepGoing ++;
                            //clearInterval(showText);
                        }
                    }

                    /**
                    if(reverse !== keepGoing ){ //backward
                        if(indice-- > fallBack[reverse]){
                            //console.log("value is " + indice);
                            $currentElement.text(function (_,txt) {
                                return txt.slice(0, -1);
                            });
                        }else{
                            reverse ++;
                            indice = 0;
                            //clearInterval(showText);
                        }
                    }
                     **/
                }, dataSpeed);
        }

        return {
            init: init
        }
    }

    // Plugin jQuery
    $.fn.typewriter = function(options) {
        return this.each(function () {
            let writer =  new typewriter();
            writer.init(this, options);
            $.data( this, 'typewriter', writer);
        });
    };

    $.fn.typewriter.options = {
        'speed' : 3000
    };

})(jQuery, window, document);

