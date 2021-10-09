import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Redirect, Link } from "react-router-dom";
import { RouteComponentProps } from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import Checkbox from "@material-ui/core/Checkbox";

interface IEditTaskState {
  isLoaded: boolean;
  title: string;
  description: string;
  maxRating: number;
  courseId: number;
  courseMentorId: string;
  edited: boolean;
  hasDeadline: boolean;
  deadlineDate: Date | undefined;
  isDeadlineStrict: boolean;
  publicationDate: Date;
}

interface IEditTaskProps {
  taskId: string;
}

export default class EditTask extends React.Component<
  RouteComponentProps<IEditTaskProps>,
  IEditTaskState
> {
  constructor(props: RouteComponentProps<IEditTaskProps>) {
    super(props);
    this.state = {
      isLoaded: false,
      title: "",
      description: "",
      maxRating: 0,
      courseId: 0,
      courseMentorId: "",
      edited: false,
      hasDeadline: false,
      deadlineDate: new Date(),
      isDeadlineStrict: false,
      publicationDate: new Date()
    };
  }

  public async handleSubmit(e: any) {
      e.preventDefault();
      ApiSingleton.tasksApi
        .apiTasksUpdateByTaskIdPut(+this.props.match.params.taskId, this.state)
        .then((res) => {
          this.setState({ edited: true })
        });
  }

  public render() {
    if (this.state.edited) {
      return <Redirect to={"/courses/" + this.state.courseId} />;
    }

    if (this.state.isLoaded) {
      if (
        !ApiSingleton.authService.isLoggedIn() ||
        !this.state.courseMentorId.includes(ApiSingleton.authService.getUserId())
      ) {
        return (
          <Typography variant="h6" gutterBottom>
            Только преподаваталь может редактировать задачу
          </Typography>
        );
      }
      return (
        <div>
          &nbsp;{" "}
          <Link to={"/courses/" + this.state.courseId.toString()}>
            Назад к курсу
          </Link>
          <br />
          <br />
          <div className="container">
            <Typography variant="h6" gutterBottom>
              Редактировать задачу
            </Typography>
            <form onSubmit={(e) => this.handleSubmit(e)}>
              <TextField
                required
                label="Название задачи"
                variant="outlined"
                margin="normal"
                value={this.state.title}
                onChange={(e) => this.setState({ title: e.target.value })}
              />
              <br />
              <TextField
                required
                label="Баллы"
                variant="outlined"
                margin="normal"
                type="number"
                value={this.state.maxRating}
                onChange={(e) => this.setState({ maxRating: +e.target.value })}
              />
              <br />
              <TextField
                multiline
                fullWidth
                rows="4"
                rowsMax="10"
                label="Условие задачи"
                variant="outlined"
                margin="normal"
                value={this.state.description}
                onChange={(e) => this.setState({ description: e.target.value })}
              />
              <br />
              <div>
                  <TextField
                      id="datetime-local"
                      label="Дата публикации"
                      type="datetime-local"
                      defaultValue={this.state.publicationDate}
                      onChange={(e) => this.setState({publicationDate: new Date(e.target.value)})}
                      InputLabelProps={{
                          shrink: true,
                      }}
                  />
              </div>  
              <label>
                <Checkbox
                    color="primary"
                    checked={this.state.hasDeadline}
                    onChange={(e) =>
                    {
                      this.setState({
                        hasDeadline: e.target.checked,
                        deadlineDate: undefined,
                      })
                    }}
                />
                Добавить дедлайн
              </label>
              {this.state.hasDeadline &&
              <div>
                <TextField
                    id="datetime-local"
                    label="Дедлайн задачи"
                    type="datetime-local"
                    defaultValue={this.state.deadlineDate}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                    onChange={(e) => this.setState({deadlineDate: new Date(e.target.value)})}
                />
                <label>
                  <Checkbox
                      color="primary"
                      onChange={(e) => this.setState({isDeadlineStrict: e.target.checked})}
                  />
                  Запретить отправку заданий после дедлайна
                </label>
              </div>
              }
              <br />
              <Button
                size="small"
                variant="contained"
                color="primary"
                type="submit"
              >
                Редактировать задачу
              </Button>
            </form>
          </div>
        </div>
      );
    }

    return "";
  }

  async componentDidMount() {
    await ApiSingleton.tasksApi.apiTasksGetByTaskIdGet(+this.props.match.params.taskId)
      .then(async (task) =>
        await ApiSingleton.homeworksApi
        .apiHomeworksGetByHomeworkIdGet(task.homeworkId!)
        .then(async (homework) =>
          await ApiSingleton.coursesApi
                .apiCoursesByCourseIdGet(homework.courseId!)
          .then((course) =>
            this.setState({
              isLoaded: true,
              title: task.title!,
              description: task.description!,
              maxRating: task.maxRating!,
              courseId: homework.courseId!,
              courseMentorId: course.mentorIds!,
              hasDeadline: task.hasDeadline!,
              deadlineDate: task.deadlineDate!,
              isDeadlineStrict: task.isDeadlineStrict!,
              publicationDate: task.publicationDate! as Date
            })
          )
        )
    );
  }
}
