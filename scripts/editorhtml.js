export const EDITORHTML = {
  property: `<div class="Property" data-property="{{property}}">
  <div class="Property--Label">{{property}}</div>
  <div class="Property--Value">{{before}}<input type="{{type}}" name="{{property}}" value="{{value}}">{{after}}</div>
</div>`,
  numberAction: `<button class="Property__Number--Action" data-number-action="{{action}}">{{action}}</button>`,
  propertySelect: `<div class="Property" data-property="{{property}}">
  <div class="Property--Label">{{property}}</div>
  <select class="Property--Value" name="{{property}}">{{options}}</select>
</div>`,
  propertyOption: '<option value="{{value}}">{{text}}</option>',
  propActions: `<hr><div class="Prop__Actions"><button class="Button mt-10" data-action="duplicate-prop">{{ t:duplicate }}</button><button class="Button mt-10" data-action="remove-prop">{{ t:remove }}</button><button class="Button mt-10" data-action="place-prop" data-active="false">{{ t:place }}</button></div>`,
  leveloption: `<option value="{{level}}">{{name}}</option>`,
  outlineProp: `<button class="Button--Prop" data-action="show-properties" data-location="{{location}}" data-id="{{id}}"><span>{{id}}</span> : <span>{{class}}</span></button>`
}