import {User} from "./user.model.ts";

export interface Blog {
    articleCommentCount: number;
    articleContent: string;
    articleDate: string;
    articleId: number;
    articleLikeCount: number;
    articleTitle: string;
    articleViews: number;
    blogUsers: User;
}
