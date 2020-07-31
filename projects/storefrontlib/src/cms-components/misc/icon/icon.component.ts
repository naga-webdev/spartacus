import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  Renderer2,
} from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { DirectionMode } from '../../../layout/config/direction.model';
import { IconLoaderService } from './icon-loader.service';
import { ICON_TYPE } from './icon.model';

/**
 *
 * The icon component can be added in different ways:
 *
 * With the component selector:
 * `<cx-icon type="SEARCH"></cx-icon>`
 *
 * With the attribute selector:
 * `<span cxIcon="STAR"></span>`
 *
 * Additionally, content can be projected to the icon:
 *
 * `<button cxIcon="HAPPY">happy label</button>`
 *
 * The above button would become (based on a TEXT resource type):
 * `<button>😊happy label</button>`
 *
 * While the content is projected, the icon itself doesn't require an
 * additional DOM node which is an advantage over the component selector.
 */
@Component({
  selector: 'cx-icon,[cxIcon]',
  templateUrl: './icon.component.html',
})
export class IconComponent {
  /**
   * The cxIcon directive is bound to the icon type. You can feed the `ICON_TYPE` to
   * accomplish a configurable button in the UI.
   */
  @Input() set cxIcon(type: ICON_TYPE) {
    this.setIcon(type);
  }

  /**
   * The type input parameter is bound to the icon type. You can feed the `ICON_TYPE` to
   * accomplish a configurable button in the UI.
   */
  @Input() set type(type: ICON_TYPE) {
    this.setIcon(type);
  }

  /**
   * the icon provides an html fragment that is used to add SVG or text based icons.
   */
  icon: SafeHtml;

  /**
   * The flip direction adds information to the DOM on how it should behave for a specific
   * direction (ltr vs rtl).
   */
  @HostBinding('attr.flip-at') flipDirection:
    | DirectionMode.LTR
    | DirectionMode.RTL;

  /**
   * Maintains the applied style classes so we can remove them when the
   * icon type changes at run time.
   */
  protected styleClasses: string[];

  constructor(
    protected iconLoader: IconLoaderService,
    protected elementRef: ElementRef<HTMLElement>,
    protected renderer: Renderer2
  ) {}

  protected setIcon(type: ICON_TYPE): void {
    if (!type || <string>type === '') {
      return;
    }
    this.icon = this.iconLoader.getHtml(type);
    this.addStyleClasses(type);
    this.iconLoader.addLinkResource(type);
    // the flip direction is added so that icons can be flipped for rtl vs ltr
    this.flipDirection = this.iconLoader.getFlipDirection(type);
  }

  /**
   * Adds the style classes and the link resource (if available).
   */
  protected addStyleClasses(type: ICON_TYPE): void {
    this.renderer.addClass(this.host, 'cx-icon');

    if (this.styleClasses) {
      this.styleClasses.forEach((cls) =>
        this.renderer.removeClass(this.host, cls)
      );
    }

    this.styleClasses = this.iconLoader.getStyleClasses(type).split(' ');

    this.styleClasses.forEach((cls) => {
      if (cls !== '') {
        this.renderer.addClass(this.host, cls);
      }
    });
  }

  protected get host() {
    return this.elementRef.nativeElement;
  }
}
