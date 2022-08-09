export const EDITORHTML = {
  property: `<div class="Property" data-property="{{property}}">
  <div class="Property--Label">{{property}}</div>
  <input class="Property--Value" type="{{type}}" name="{{property}}" value="{{value}}">
</div>`,
  removeProp: `<button class="Button" data-action="remove-prop">Remove</button>`,
  leveloption: `<option value="{{level}}">{{level}}</option>`,
  outlineProp: `<button class="Outline--Subheading" data-action="show-properties" data-location="{{location}}" data-id="{{id}}">{{id}} : <span>{{class}}</span></button>`
}