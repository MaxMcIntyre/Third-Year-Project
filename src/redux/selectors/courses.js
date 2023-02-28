import { createSelector } from 'reselect';

const getCourses = state => state.courses;

export const getCourseList = createSelector(
    [getCourses],
    courses => courses.list
);