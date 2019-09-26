module AMVE {
    /**
     * Interface for event handling
     */
    export interface IEventSource {

        /**
         * Adds an event listener
         * 
         * @param  {string} event the name of the event to listen for
         * @param  {EventListener} eventListener the event listener to add
         */
        addEventListener(event: string, handler: EventListener);

        /**
         * Removes an event listener
         * 
         * @param  {string} event the name of the event to listen for
         * @param  {EventListener} eventListener the event listener to remove
         */
        removeEventListener(event: string, handler: EventListener);

        /**
         * Triggers an event
         * 
         * @param  {string} event the name of the event to trigger
         */
        trigger(event: string);
    }
}

export = AMVE;
