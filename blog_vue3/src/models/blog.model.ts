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
    blogLabels:BlogLabels;
    blogSorts:BlogSorts
}


interface BlogLabels {
    labelAlias: string,
    labelDescription: string
    labelId: number
    labelName: string
}


interface BlogSorts{
    parentSortId: number
    sortAlias: string
    sortDescription: string
    sortId: number
    sortName: string
}
