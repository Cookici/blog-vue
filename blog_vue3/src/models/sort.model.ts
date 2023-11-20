export interface SortModel{
    sortId:number;
    sortName:string;
    sortAlias:string;
    sortDescription:string
    children:SortModel;
}