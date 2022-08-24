export const EDITORHTML = {
  property: `<div class="Property" data-property="{{property}}">
  <div class="Property--Label">{{property}}</div>
  <input class="Property--Value" type="{{type}}" name="{{property}}" value="{{value}}">
</div>`,
  propertySelect: `<div class="Property" data-property="{{property}}">
  <div class="Property--Label">{{property}}</div>
  <select class="Property--Value" name="{{property}}">{{options}}</select>
</div>`,
  propertyOption: '<option value="{{value}}">{{text}}</option>',
  propActions: `<div><button class="Button mr-10 mt-10" data-action="duplicate-prop">{{ t:duplicate }}</button><div><button class="Button mr-10 mt-10" data-action="remove-prop">{{ t:remove }}</button><button class="Button mt-10" data-action="place-prop" data-active="false">{{ t:place }}</button></div>`,
  leveloption: `<option value="{{level}}">{{level}}</option>`,
  outlineProp: `<button class="Button--Prop" data-action="show-properties" data-location="{{location}}" data-id="{{id}}"><span>{{id}}</span> : <span>{{class}}</span></button>`
}