# DB VIZ

This is a wip, it will be a visualization tool for any database when it is done.
It will work through the command line and expect you to either ask it for schemas,
or a row. With that decision, it will query for the data and all related data,
then create an html file that will display that data in a graph format with the
relationships highlighted. There will be more features later, but for now, this
is what I want for my job, so that's what it is going to be!

The first db will be postgresql, because that is what we currently use at my company.
After that, sqllite will be added, then mongodb. Then it will be opened up to the
public for any other db that people want to add.

TLDR: ONLY WORKS ON POSTGRES

steps to use:
1. clone the repo
2. cd into the repo
3. type 'go build && go run dbVisualizer.com'
   
![Screenshot 2025-02-12 at 18 39 21](https://github.com/user-attachments/assets/f7a4fdf8-d037-4047-b565-0ec6eb210549)

4. Select the first option (second will come with future pr's)
5. Fill in the following (With your db data -> reminder, only works with postgresql at the moment):
   
![Screenshot 2025-02-12 at 18 40 14](https://github.com/user-attachments/assets/3978eac1-9cb2-45cf-b27e-062b06b46f40)
![Screenshot 2025-02-12 at 18 40 26](https://github.com/user-attachments/assets/fad93e38-3690-4c36-b7bf-d65853bfc6e9)
![Screenshot 2025-02-12 at 18 40 36](https://github.com/user-attachments/assets/e267ff6c-6dda-424f-890b-6c7163589563)
![Screenshot 2025-02-12 at 18 40 45](https://github.com/user-attachments/assets/dee568f0-dc72-4a27-a2cf-7566df62d93b)

6. Wait for the following screen:

![Screenshot 2025-02-12 at 18 40 54](https://github.com/user-attachments/assets/dc09001c-6218-424c-a37c-2ecbe2e729f0)

7. Go to: http://localhost:42069/
8. The following screen should be there

![Screenshot 2025-02-12 at 18 37 53](https://github.com/user-attachments/assets/0b21bda5-583e-458f-ab9c-52deaaf92600)

9. Click on the details to view the data
10. Nested details are foreign keys, table data is non-foriegn
11. After 2 layers of nesting, on hover of detail, you get a tooltip that is clickable
12. Click on the tooltip -> should make that table the new main table

![Screenshot 2025-02-12 at 18 45 22](https://github.com/user-attachments/assets/b41ce613-90c6-4e96-9d7f-182a0dcb84c3)

13. There are now breadcrumbs that are clickable
14. To go back to the main view click reset, or the left-most breadcrumb
15. To change tables, enter a new table name in the cli
16. You might need to reload the page at localhost (bug I am working on)


   
   
