# 📝 Variables

Labspaces provide the ability to create components that request input from users, which are stored as variables.

## Variable setting

This will create a card to be used for variable setting and set the **greeting** variable:

::variableDefinition[greeting]{prompt="What greeting would you like to have?"}

This will create a button that will set the value of **greeting** specifically to "hello"

::variableSetButton[Display alerts below]{variables="greeting=hello"}

This will create a button that will set _multiple_ variables:

::variableSetButton[Set multiple values]{variables="greeting=hello,secondaryGreeting=goodbye"}


## Variable usage

The **greeting** variable currently has a value of: **$$greeting$$**

This should also work if running a command:

```bash
echo "$$greeting$$"
```

Or saving a file:

```text save-as=test.txt
$$greeting$$
```


The **secondaryGreeting** variable currently has a value of: **$$secondaryGreeting$$**

```bash
echo "$$secondaryGreeting$$"
```

## Conditional display

Variables can be used to support the conditional displaying of text.

- The alert below will only display if **greeting** is set to `hello`.

    :::conditionalDisplay{variable="greeting" requiredValue="hello"}
    > [!TIP]
    > It appears the conditional is set and this content is displayed!
    :::

- The following alert will display if the **greeting** field has no value set.

    :::conditionalDisplay{variable="greeting" hasNoValue}
    > [!TIP]
    > It appears the conditional is set and this content is displayed!
    :::

## Default Labspace variables

As a help to authors, variables can also be defined in the `labspace.yaml` file to reduce maintenance where a value may appear in multiple places throughout the writeup. 

For example, the following `labspace.yaml` configuration will define a variable named `pythonImageTag`:

```yaml
variables:
  pythonImageTag: 3.14-alpine
```

It can be injected using the same variable syntax throughout the markdown:

```dockerfile
FROM python:\$\$pythonImageTag\$\$
```

will then render as:

```dockerfile
FROM python:$$pythonImageTag$$
```
