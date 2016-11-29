/// <reference path='../Modules/Common.ts' />

module AMVE {
    /**
     * Interface for event handling
     */
    export interface IPropertyChangeEventSource extends IEventSource {

        /**
         * Adds a property listener
         * 
         * @param  {string} property the name of the property to listen for change events
         * @param  {EventListener} propertyChangedListener the event listener to add
         */
        addPropertyChangedListener(property: string, propertyChangedListener: EventListener);

        /**
         * Removes a property listener
         *
         * @param  {string} property the name of the property to listen for change events
         * @param  {EventListener} propertyChangedListener the event listener to add
         */
        removePropertyChangedListener(property: string, propertyChangedListener: EventListener);

        /**
         * Triggers an property changed event
         * 
         * @param  {string} property the property that changed
         */
        propertyChanged(property: string);
    }
}