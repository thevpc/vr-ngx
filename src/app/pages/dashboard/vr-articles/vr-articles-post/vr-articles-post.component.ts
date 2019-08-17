
import { Component, Input } from '@angular/core';
import { NewsPost } from '../../../layout/news.service';


@Component({
  selector: 'vr-articles-post',
  templateUrl: 'vr-articles-post.component.html',
})
export class VrArticlesPostComponent {

  @Input() post: NewsPost;
}
